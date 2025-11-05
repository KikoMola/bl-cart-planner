import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BricklinkSearchResponse, BricklinkItem, BricklinkPiece } from '../interfaces/bricklink';

@Injectable({
    providedIn: 'root',
})
export class Bricklink {
    private http = inject(HttpClient);
    private readonly SEARCH_URL = 'https://www.bricklink.com/ajax/clone/search/searchproduct.ajax';
    private readonly ITEM_DETAILS_URL =
        'https://www.bricklink.com/ajax/renovate/catalog/getItemImageList.ajax';
    private readonly INVENTORY_URL = '/api/bricklink';

    searchSet(setNumber: string): Observable<BricklinkSearchResponse> {
        const params = {
            q: setNumber,
            st: '0',
            cond: '',
            type: 'S',
            cat: '',
            yf: '0',
            yt: '0',
            loc: '',
            reg: '0',
            ca: '0',
            ss: '',
            pmt: '',
            nmp: '0',
            color: '-1',
            min: '0',
            max: '0',
            minqty: '0',
            nosuperlot: '1',
            incomplete: '0',
            showempty: '1',
            rpp: '25',
            pi: '1',
            ci: '0',
        };

        return this.http.get<BricklinkSearchResponse>(this.SEARCH_URL, {
            params,
        });
    }

    getItemDetails(idItem: number): Observable<BricklinkItem> {
        const params = {
            idItem: idItem.toString(),
        };

        return this.http.get<BricklinkItem>(this.ITEM_DETAILS_URL, {
            params,
        });
    }

    getItemInventory(idItem: number): Observable<BricklinkPiece[]> {
        const params = {
            idItem: idItem.toString(),
            st: '1',
            show_invid: '0',
            show_matchcolor: '1',
        };

        return this.http
            .get(this.INVENTORY_URL, {
                params,
                responseType: 'text',
            })
            .pipe(map(html => this.parseInventoryHTML(html)));
    }

    private parseInventoryHTML(html: string): BricklinkPiece[] {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const pieces: BricklinkPiece[] = [];

        // Buscar todas las filas con clase pciinvItemRow
        const rows = doc.querySelectorAll('tr.pciinvItemRow');

        rows.forEach(row => {
            // Extraer imagen
            const imgElement = row.querySelector('img[src*="ItemImage"]');
            const imageUrl = imgElement ? 'https:' + imgElement.getAttribute('src') : '';

            // Extraer cantidad
            const qtyCell = row.querySelectorAll('td')[2];
            const quantity = qtyCell ? parseInt(qtyCell.textContent?.trim() || '0', 10) : 0;

            // Extraer número de item
            const itemNoLink = row.querySelector('a[href*="catalogitem.page"]');
            const itemNo = itemNoLink ? itemNoLink.textContent?.trim() || '' : '';

            // Extraer descripción (está en el tag <b> dentro del td con text-align: left)
            const descCell = row.querySelector('td[style*="text-align: left"]');
            const descBold = descCell?.querySelector('b');
            const description = descBold ? descBold.textContent?.trim() || '' : '';

            // Solo agregar si tenemos los datos mínimos
            if (itemNo && description) {
                pieces.push({
                    description,
                    itemNo,
                    quantity,
                    imageUrl,
                });
            }
        });

        return pieces;
    }
}
