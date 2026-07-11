import { Injectable, signal } from '@angular/core';
import { BricklinkPiece } from '../interfaces/bricklink';
import { StoreAutomationResult } from '../interfaces/store';

@Injectable({
    providedIn: 'root',
})
export class TableState {
    private currentItemId = signal<number | null>(null);
    private loadedPieces = signal<BricklinkPiece[] | null>(null);
    private currentCartId = signal<string | null>(null);
    private currentCartName = signal<string | null>(null);
    private automationResult = signal<StoreAutomationResult | null>(null);

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

    setCartId(cartId: string | null): void {
        this.currentCartId.set(cartId);
    }

    getCartId(): string | null {
        return this.currentCartId();
    }

    setCartName(name: string | null): void {
        this.currentCartName.set(name);
    }

    getCartName(): string | null {
        return this.currentCartName();
    }

    clearCart(): void {
        this.currentCartId.set(null);
        this.currentCartName.set(null);
    }

    setAutomationResult(result: StoreAutomationResult): void {
        this.automationResult.set(result);
    }

    getAutomationResult(): StoreAutomationResult | null {
        return this.automationResult();
    }

    clearAutomationResult(): void {
        this.automationResult.set(null);
    }
}
