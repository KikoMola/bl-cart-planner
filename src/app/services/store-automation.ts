import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { BricklinkAuth } from './bricklink-auth';
import { BricklinkPiece } from '../interfaces/bricklink';
import { PieceSourcingResult, StoreAutomationResult, StoreSearchResponse, AddToCartResponse } from '../interfaces/store';

interface CartAddEntry {
    invID: number;
    invQty: string;
    sellerID: number;
    sourceType: number;
}

interface ProvisionalAddition {
    item: PieceSourcingResult;
    qty: number;
    invID: number;
    price: number;
}

@Injectable({
    providedIn: 'root',
})
export class StoreAutomation {
    private http = inject(HttpClient);
    private auth = inject(BricklinkAuth);
    private readonly PROXY_URL = '/api/store-proxy';
    private readonly MAX_ITEMS_PER_REQUEST = 8;
    private readonly DELAY_BETWEEN_REQUESTS_MS = 600;

    extractColorId(imageUrl: string): number | null {
        const match = imageUrl.match(/ItemImage\/[A-Za-z]+\/(\d+)\//);
        return match ? parseInt(match[1], 10) : null;
    }

    async run(
        pieces: BricklinkPiece[],
        storeNames: string[],
        onProgress?: (message: string) => void
    ): Promise<StoreAutomationResult> {
        const log: string[] = [];
        const notify = (message: string): void => {
            log.push(message);
            onProgress?.(message);
        };

        const sourcing: PieceSourcingResult[] = pieces.map(piece => ({
            piece,
            colorID: this.extractColorId(piece.imageUrl),
            remainingQty: piece.quantity,
            addedFrom: [],
        }));

        for (const storeName of storeNames) {
            const pending = sourcing.filter(item => item.remainingQty > 0);
            if (pending.length === 0) {
                break;
            }

            notify(`Resolviendo tienda "${storeName}"...`);

            let sid: number;
            try {
                sid = await this.resolveSid(storeName);
            } catch (error) {
                notify(`No se pudo resolver la tienda "${storeName}". Se omite.`);
                continue;
            }

            const cartEntries: CartAddEntry[] = [];
            const provisional: ProvisionalAddition[] = [];

            for (const item of pending) {
                let response: StoreSearchResponse;
                try {
                    response = await this.searchItem(storeName, sid, item.piece.itemNo);
                } catch (error) {
                    notify(`Error buscando "${item.piece.itemNo}" en "${storeName}".`);
                    continue;
                }

                const candidates = (response.result?.groups ?? [])
                    .flatMap(group => group.items)
                    .filter(
                        candidate =>
                            candidate.itemNo === item.piece.itemNo &&
                            (item.colorID === null || candidate.colorID === item.colorID)
                    )
                    .sort((a, b) => a.rawConvertedPrice - b.rawConvertedPrice);

                let remaining = item.remainingQty;
                for (const candidate of candidates) {
                    if (remaining <= 0) {
                        break;
                    }

                    const qtyToAdd = Math.min(candidate.invQty, remaining);
                    if (qtyToAdd <= 0) {
                        continue;
                    }

                    cartEntries.push({
                        invID: candidate.invID,
                        invQty: qtyToAdd.toString(),
                        sellerID: sid,
                        sourceType: 1,
                    });
                    provisional.push({
                        item,
                        qty: qtyToAdd,
                        invID: candidate.invID,
                        price: candidate.rawConvertedPrice,
                    });

                    remaining -= qtyToAdd;
                }
            }

            if (cartEntries.length === 0) {
                notify(`No se encontraron piezas disponibles en "${storeName}".`);
                continue;
            }

            // Deduplicar por invID (puede repetirse si dos piezas distintas resolvieron
            // al mismo lote), sumando cantidades y fusionando las adiciones provisionales.
            const mergedEntries = new Map<number, CartAddEntry>();
            const provisionalByInvID = new Map<number, ProvisionalAddition[]>();

            for (let i = 0; i < cartEntries.length; i++) {
                const entry = cartEntries[i];
                const addition = provisional[i];

                const existing = mergedEntries.get(entry.invID);
                if (existing) {
                    existing.invQty = (parseInt(existing.invQty, 10) + parseInt(entry.invQty, 10)).toString();
                } else {
                    mergedEntries.set(entry.invID, { ...entry });
                }

                const additions = provisionalByInvID.get(entry.invID) ?? [];
                additions.push(addition);
                provisionalByInvID.set(entry.invID, additions);
            }

            const dedupedEntries = Array.from(mergedEntries.values());
            const successfulInvIDs = new Set<number>();
            let sentCount = 0;

            // Enviar en lotes pequeños con una breve pausa entre peticiones, para
            // parecer más a un uso humano normal y evitar bloqueos silenciosos.
            for (let i = 0; i < dedupedEntries.length; i += this.MAX_ITEMS_PER_REQUEST) {
                const chunk = dedupedEntries.slice(i, i + this.MAX_ITEMS_PER_REQUEST);

                let addResponse: AddToCartResponse;
                try {
                    addResponse = await this.addToCart(storeName, sid, chunk);
                } catch (error) {
                    notify(`Error añadiendo un lote de piezas al carrito de "${storeName}".`);
                    continue;
                }

                sentCount += chunk.length;

                for (const status of addResponse.itemReturnStatus ?? []) {
                    if (status.code === '0') {
                        successfulInvIDs.add(status.invID);
                    }
                }

                if (i + this.MAX_ITEMS_PER_REQUEST < dedupedEntries.length) {
                    await this.delay(this.DELAY_BETWEEN_REQUESTS_MS);
                }
            }

            let committedCount = 0;
            for (const invID of successfulInvIDs) {
                const additions = provisionalByInvID.get(invID) ?? [];
                for (const addition of additions) {
                    addition.item.remainingQty -= addition.qty;
                    addition.item.addedFrom.push({
                        invID: addition.invID,
                        quantity: addition.qty,
                        storeName,
                        price: addition.price,
                    });
                    committedCount++;
                }
            }

            if (committedCount === 0) {
                notify(`Bricklink rechazó todas las referencias enviadas a "${storeName}".`);
            } else if (committedCount < sentCount) {
                notify(
                    `Añadidas ${committedCount} de ${sentCount} referencia(s) desde "${storeName}" (el resto fue rechazado por Bricklink).`
                );
            } else {
                notify(`Añadidas ${committedCount} referencia(s) desde "${storeName}".`);
            }
        }

        return {
            sourced: sourcing.filter(item => item.addedFrom.length > 0),
            missing: sourcing.filter(item => item.remainingQty > 0),
            log,
        };
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private resolveSid(storeName: string): Promise<number> {
        return firstValueFrom(
            this.http
                .post<{ sid: number }>(this.PROXY_URL, {
                    action: 'resolveSid',
                    storeName,
                    cookie: this.auth.getCookie(),
                })
        ).then(response => response.sid);
    }

    private searchItem(storeName: string, sid: number, itemNo: string): Promise<StoreSearchResponse> {
        return firstValueFrom(
            this.http.post<StoreSearchResponse>(this.PROXY_URL, {
                action: 'search',
                storeName,
                sid,
                itemNo,
                cookie: this.auth.getCookie(),
            })
        );
    }

    private async addToCart(
        storeName: string,
        sid: number,
        itemArray: CartAddEntry[]
    ): Promise<AddToCartResponse> {
        return firstValueFrom(
            this.http.post<AddToCartResponse>(this.PROXY_URL, {
                action: 'addToCart',
                storeName,
                sid,
                itemArray,
                cookie: this.auth.getCookie(),
            })
        );
    }
}
