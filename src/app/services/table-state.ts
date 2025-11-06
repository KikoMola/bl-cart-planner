import { Injectable, signal } from '@angular/core';
import { BricklinkPiece } from '../interfaces/bricklink';

@Injectable({
    providedIn: 'root',
})
export class TableState {
    private currentItemId = signal<number | null>(null);
    private loadedPieces = signal<BricklinkPiece[] | null>(null);

    setItemId(idItem: number): void {
        this.currentItemId.set(idItem);
    }

    getItemId(): number | null {
        return this.currentItemId();
    }

    clearItemId(): void {
        this.currentItemId.set(null);
    }

    setPieces(pieces: BricklinkPiece[]): void {
        this.loadedPieces.set(pieces);
    }

    getPieces(): BricklinkPiece[] | null {
        return this.loadedPieces();
    }

    clearPieces(): void {
        this.loadedPieces.set(null);
    }
}
