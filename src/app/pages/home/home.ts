import { Component, inject, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Bricklink } from '../../services/bricklink';
import { TableState } from '../../services/table-state';
import { CartStorage } from '../../services/cart-storage';
import { Item, BricklinkItem } from '../../interfaces/bricklink';
import { SavedCart } from '../../interfaces/cart';
import { forkJoin } from 'rxjs';
import { DatePipe } from '@angular/common';

interface ItemWithDetails {
    searchItem: Item;
    details: BricklinkItem;
    imageUrl: string;
}

@Component({
    selector: 'app-home',
    imports: [TranslateModule, FormsModule, DatePipe],
    templateUrl: './home.html',
})
export class Home {
    private translateService = inject(TranslateService);
    private bricklinkService = inject(Bricklink);
    private router = inject(Router);
    private tableState = inject(TableState);
    private cartStorage = inject(CartStorage);

    private readonly LANG_STORAGE_KEY = 'blcpl-lang';
    private readonly SUPPORTED_LANGUAGES = ['es', 'en', 'de', 'fr'];

    setNumber = signal('');
    currentLanguage = signal('en');
    isSearching = signal(false);
    items = signal<ItemWithDetails[]>([]);
    errorMessage = signal<string | null>(null);
    savedCarts = signal<SavedCart[]>([]);

    getCartPiecesCount(cart: SavedCart): number {
        return (cart.pieces as any[]).length;
    }

    constructor() {
        this.initializeLanguage();
    }

    ngOnInit(): void {
        this.currentLanguage.set(this.translateService.currentLang || 'en');
        this.loadSavedCarts();
    }

    private loadSavedCarts(): void {
        this.savedCarts.set(this.cartStorage.getAllCarts());
    }

    private initializeLanguage(): void {
        // Intentar obtener el idioma del localStorage
        const storedLang = localStorage.getItem(this.LANG_STORAGE_KEY);

        if (storedLang && this.SUPPORTED_LANGUAGES.includes(storedLang)) {
            // Si existe y es válido, usarlo
            this.translateService.setFallbackLang(storedLang);
            this.translateService.use(storedLang);
            this.currentLanguage.set(storedLang);
        } else {
            // Si no existe, obtener el idioma del navegador
            const browserLang = navigator.language.split('-')[0];
            const langToUse = this.SUPPORTED_LANGUAGES.includes(browserLang) ? browserLang : 'en';

            // Configurar y guardar en localStorage
            this.translateService.setFallbackLang(langToUse);
            this.translateService.use(langToUse);
            this.currentLanguage.set(langToUse);
            localStorage.setItem(this.LANG_STORAGE_KEY, langToUse);
        }
    }

    onSearch(): void {
        const setNumberValue = this.setNumber().trim();
        if (!setNumberValue) return;

        this.isSearching.set(true);
        this.errorMessage.set(null);
        this.items.set([]);

        this.bricklinkService.searchSet(setNumberValue).subscribe({
            next: response => {
                console.log('Search results:', response);

                if (response.returnCode === 0 && response.result.typeList.length > 0) {
                    const items = response.result.typeList[0].items;

                    // Crear un array de observables para obtener los detalles de cada item
                    const detailRequests = items.map(item =>
                        this.bricklinkService.getItemDetails(item.idItem)
                    );

                    // Ejecutar todas las peticiones en paralelo
                    forkJoin(detailRequests).subscribe({
                        next: detailsArray => {
                            const itemsWithDetails: ItemWithDetails[] = items.map((item, index) => {
                                const details = detailsArray[index];
                                // Buscar la imagen con type 'L'
                                const largeImage = details.item.imglist.find(
                                    img => img.type === 'L'
                                );
                                return {
                                    searchItem: item,
                                    details: details,
                                    imageUrl: largeImage?.main_url || '',
                                };
                            });

                            this.items.set(itemsWithDetails);
                            this.isSearching.set(false);
                        },
                        error: error => {
                            console.error('Error getting item details:', error);
                            this.errorMessage.set('Error al obtener detalles de los items.');
                            this.isSearching.set(false);
                        },
                    });
                } else {
                    this.errorMessage.set('No se encontraron resultados.');
                    this.isSearching.set(false);
                }
            },
            error: error => {
                console.error('Search error:', error);
                this.errorMessage.set('Error al buscar el set. Por favor, intenta de nuevo.');
                this.isSearching.set(false);
            },
        });
    }

    changeLanguage(lang: string): void {
        this.translateService.use(lang);
        this.currentLanguage.set(lang);
        // Guardar el idioma seleccionado en localStorage
        localStorage.setItem(this.LANG_STORAGE_KEY, lang);
    }

    navigateToTable(idItem: number): void {
        this.tableState.setItemId(idItem);
        this.router.navigate(['/table']);
    }

    loadCart(cart: SavedCart): void {
        // Descomprimir las piezas al formato completo
        const pieces = (cart.pieces as any[]).map(p => ({
            description: p.d,
            itemNo: p.i,
            quantity: p.q,
            imageUrl: p.img,
            price: p.p,
        }));

        // Guardar en TableState para que Table component las cargue
        this.tableState.setItemId(cart.idItem);
        this.tableState.setPieces(pieces);
        this.tableState.setCartId(cart.id);
        this.tableState.setCartName(cart.name || null);

        // Navegar a la tabla
        this.router.navigate(['/table']);
    }

    deleteCart(cart: SavedCart): void {
        const confirmMessage = this.translateService.instant('savedCarts.confirmDelete');
        if (confirm(confirmMessage)) {
            this.cartStorage.deleteCart(cart.id);
            this.loadSavedCarts();
        }
    }
}
