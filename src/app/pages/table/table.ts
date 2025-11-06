import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Bricklink } from '../../services/bricklink';
import { TableState } from '../../services/table-state';
import { CartStorage } from '../../services/cart-storage';
import { BricklinkPiece } from '../../interfaces/bricklink';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-table',
    imports: [TranslateModule, FormsModule, DecimalPipe],
    templateUrl: './table.html',
    styles: ``,
})
export class Table implements OnInit {
    private router = inject(Router);
    private bricklinkService = inject(Bricklink);
    private tableState = inject(TableState);
    private cartStorage = inject(CartStorage);
    private translateService = inject(TranslateService);

    pieces = signal<BricklinkPiece[]>([]);
    isLoading = signal(false);
    errorMessage = signal<string | null>(null);
    cartName = signal('');
    shippingCost = signal(0);
    private currentItemId: number | null = null;
    private currentCartId: string | null = null;

    // Computed para suma de precios totales
    totalPiecesPrice = computed(() => {
        return this.pieces().reduce((sum, piece) => {
            return sum + this.calculateTotalPrice(piece);
        }, 0);
    });

    // Computed para suma final
    grandTotal = computed(() => {
        return this.totalPiecesPrice() + (this.shippingCost() || 0);
    });

    ngOnInit(): void {
        const idItem = this.tableState.getItemId();
        const loadedPieces = this.tableState.getPieces();
        const cartId = this.tableState.getCartId();
        const cartName = this.tableState.getCartName();

        // Si hay piezas precargadas (desde carrito guardado), usarlas directamente
        if (loadedPieces) {
            this.currentItemId = idItem;
            this.currentCartId = cartId;
            this.cartName.set(cartName || '');
            this.pieces.set(loadedPieces);
            this.tableState.clearPieces(); // Limpiar después de usar
            this.tableState.clearCart(); // Limpiar info del carrito
            return;
        }

        // Si no, cargar desde Bricklink (nueva búsqueda)
        if (idItem) {
            this.currentItemId = idItem;
            this.currentCartId = null; // No hay cartId en búsqueda nueva
            this.loadInventory(idItem);
        } else {
            this.errorMessage.set('ID de item no proporcionado');
        }
    }

    navigateToSearch(): void {
        this.router.navigate(['/']);
    }

    calculateTotalPrice(piece: BricklinkPiece): number {
        return piece.price ? piece.quantity * piece.price : 0;
    }

    saveCart(): void {
        if (!this.currentItemId || this.pieces().length === 0) {
            return;
        }

        try {
            const name = this.cartName().trim() || undefined;

            // Si hay cartId, actualizar el existente
            if (this.currentCartId) {
                this.cartStorage.updateCart(this.currentCartId, this.pieces(), name);
                const storageSize = this.cartStorage.getStorageSize();

                console.log(`Cart updated with ID: ${this.currentCartId}`);
                console.log(`Storage size: ${storageSize.toFixed(2)} KB`);

                alert(this.translateService.instant('table.cartSaved'));
            } else {
                // Si no hay cartId, crear uno nuevo
                const cartId = this.cartStorage.saveCart(this.currentItemId, this.pieces(), name);
                this.currentCartId = cartId; // Guardar el nuevo ID para futuras actualizaciones
                const storageSize = this.cartStorage.getStorageSize();

                console.log(`Cart saved with ID: ${cartId}`);
                console.log(`Storage size: ${storageSize.toFixed(2)} KB`);

                alert(this.translateService.instant('table.cartSaved'));
            }
        } catch (error) {
            console.error('Error saving cart:', error);
            alert('Error al guardar el carrito. Intenta de nuevo.');
        }
    }

    private loadInventory(idItem: number): void {
        this.isLoading.set(true);
        this.errorMessage.set(null);

        this.bricklinkService.getItemInventory(idItem).subscribe({
            next: pieces => {
                console.log('Pieces loaded:', pieces);
                this.pieces.set(pieces);
                this.isLoading.set(false);
            },
            error: error => {
                console.error('Error loading inventory:', error);
                this.errorMessage.set(
                    'Error al cargar el inventario. Por favor, intenta de nuevo.'
                );
                this.isLoading.set(false);
            },
        });
    }
}
