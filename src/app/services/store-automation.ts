import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { BricklinkAuth } from './bricklink-auth';
import { BricklinkPiece } from '../interfaces/bricklink';
import { PieceSourcingResult, StoreAutomationResult, StoreSearchResponse } from '../interfaces/store';

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

            try {
                await this.addToCart(storeName, sid, cartEntries);
            } catch (error) {
                notify(`Error añadiendo piezas al carrito de "${storeName}". Se descartan sus resultados.`);
                continue;
            }

            for (const addition of provisional) {
                addition.item.remainingQty -= addition.qty;
                addition.item.addedFrom.push({
                    invID: addition.invID,
                    quantity: addition.qty,
                    storeName,
                    price: addition.price,
                });
            }

            notify(`Añadidas ${cartEntries.length} referencia(s) desde "${storeName}".`);
        }

        return {
            sourced: sourcing.filter(item => item.addedFrom.length > 0),
            missing: sourcing.filter(item => item.remainingQty > 0),
            log,
        };
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

    private async addToCart(storeName: string, sid: number, itemArray: CartAddEntry[]): Promise<void> {
        await firstValueFrom(
            this.http.post(this.PROXY_URL, {
                action: 'addToCart',
                storeName,
                sid,
                itemArray,
                cookie: this.auth.getCookie(),
            })
        );
    }
}
