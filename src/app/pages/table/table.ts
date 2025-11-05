import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Bricklink } from '../../services/bricklink';
import { BricklinkPiece } from '../../interfaces/bricklink';

@Component({
    selector: 'app-table',
    imports: [],
    templateUrl: './table.html',
    styles: ``,
})
export class Table implements OnInit {
    private route = inject(ActivatedRoute);
    private bricklinkService = inject(Bricklink);

    pieces = signal<BricklinkPiece[]>([]);
    isLoading = signal(false);
    errorMessage = signal<string | null>(null);

    ngOnInit(): void {
        const idItem = this.route.snapshot.paramMap.get('idItem');

        if (idItem) {
            this.loadInventory(parseInt(idItem, 10));
        } else {
            this.errorMessage.set('ID de item no proporcionado');
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
