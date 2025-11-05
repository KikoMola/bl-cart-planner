import { Component, inject, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { Bricklink } from '../../services/bricklink';
import { BricklinkSearchResponse } from '../../interfaces/bricklink';

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
    searchResults = signal<BricklinkSearchResponse | null>(null);
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

        this.bricklinkService.searchSet(setNumberValue).subscribe({
            next: (response) => {
                console.log('Search results:', response);
                this.searchResults.set(response);
                this.isSearching.set(false);
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
