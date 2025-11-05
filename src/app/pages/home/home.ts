import { Component, inject, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { Bricklink } from '../../services/bricklink';
import { Item, BricklinkItem } from '../../interfaces/bricklink';
import { forkJoin } from 'rxjs';

interface ItemWithDetails {
    searchItem: Item;
    details: BricklinkItem;
    imageUrl: string;
}

@Component({
    selector: 'app-home',
    imports: [TranslateModule, FormsModule],
    templateUrl: './home.html',
})
export class Home {
    private translateService = inject(TranslateService);
    private bricklinkService = inject(Bricklink);

    setNumber = signal('');
    currentLanguage = signal('en');
    isSearching = signal(false);
    items = signal<ItemWithDetails[]>([]);
    errorMessage = signal<string | null>(null);

    constructor() {
        // Inicializar el idioma por defecto
        this.translateService.setDefaultLang('en');
        this.translateService.use('en');
    }

    ngOnInit(): void {
        this.currentLanguage.set(this.translateService.currentLang || 'en');
    }

    onSearch(): void {
        const setNumberValue = this.setNumber().trim();
        if (!setNumberValue) return;

        this.isSearching.set(true);
        this.errorMessage.set(null);
        this.items.set([]);

        this.bricklinkService.searchSet(setNumberValue).subscribe({
            next: (response) => {
                console.log('Search results:', response);

                if (response.returnCode === 0 && response.result.typeList.length > 0) {
                    const items = response.result.typeList[0].items;

                    // Crear un array de observables para obtener los detalles de cada item
                    const detailRequests = items.map((item) =>
                        this.bricklinkService.getItemDetails(item.idItem)
                    );

                    // Ejecutar todas las peticiones en paralelo
                    forkJoin(detailRequests).subscribe({
                        next: (detailsArray) => {
                            const itemsWithDetails: ItemWithDetails[] = items.map(
                                (item, index) => {
                                    const details = detailsArray[index];
                                    // Buscar la imagen con type 'L'
                                    const largeImage = details.item.imglist.find(
                                        (img) => img.type === 'L'
                                    );
                                    return {
                                        searchItem: item,
                                        details: details,
                                        imageUrl: largeImage?.main_url || '',
                                    };
                                }
                            );

                            this.items.set(itemsWithDetails);
                            this.isSearching.set(false);
                        },
                        error: (error) => {
                            console.error('Error getting item details:', error);
                            this.errorMessage.set(
                                'Error al obtener detalles de los items.'
                            );
                            this.isSearching.set(false);
                        },
                    });
                } else {
                    this.errorMessage.set('No se encontraron resultados.');
                    this.isSearching.set(false);
                }
            },
            error: (error) => {
                console.error('Search error:', error);
                this.errorMessage.set('Error al buscar el set. Por favor, intenta de nuevo.');
                this.isSearching.set(false);
            },
        });
    }

    changeLanguage(lang: string): void {
        this.translateService.use(lang);
        this.currentLanguage.set(lang);
    }
}
