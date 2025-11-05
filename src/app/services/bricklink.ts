import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BricklinkSearchResponse, BricklinkItem } from '../interfaces/bricklink';

@Injectable({
    providedIn: 'root',
})
export class Bricklink {
    private http = inject(HttpClient);
    private readonly SEARCH_URL =
        'https://www.bricklink.com/ajax/clone/search/searchproduct.ajax';
    private readonly ITEM_DETAILS_URL =
        'https://www.bricklink.com/ajax/renovate/catalog/getItemImageList.ajax';

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
}
