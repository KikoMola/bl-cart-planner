import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class TableState {
    private currentItemId = signal<number | null>(null);

    setItemId(idItem: number): void {
        this.currentItemId.set(idItem);
    }

    getItemId(): number | null {
        return this.currentItemId();
    }

    clearItemId(): void {
        this.currentItemId.set(null);
    }
}
