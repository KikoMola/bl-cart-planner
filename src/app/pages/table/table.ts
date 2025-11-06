import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Bricklink } from '../../services/bricklink';
import { TableState } from '../../services/table-state';
import { BricklinkPiece } from '../../interfaces/bricklink';
import { TranslateModule } from '@ngx-translate/core';
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

    pieces = signal<BricklinkPiece[]>([]);
    isLoading = signal(false);
    errorMessage = signal<string | null>(null);

    ngOnInit(): void {
        const idItem = this.tableState.getItemId();

        if (idItem) {
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
