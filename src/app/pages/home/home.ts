import { Component, inject, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-home',
    imports: [TranslateModule, FormsModule],
    templateUrl: './home.html',
    styleUrl: './home.css',
})
export class Home {
    private translateService = inject(TranslateService);

    setNumber = signal('');
    currentLanguage = signal('en');

    constructor() {
        // Inicializar el idioma por defecto
        this.translateService.setDefaultLang('en');
        this.translateService.use('en');
    }

    ngOnInit(): void {
        this.currentLanguage.set(this.translateService.currentLang || 'en');
    }

    onSearch(): void {
        if (this.setNumber().trim()) {
            console.log('Searching for set:', this.setNumber());
            // Funcionalidad de búsqueda se implementará después
        }
    }

    changeLanguage(lang: string): void {
        this.translateService.use(lang);
        this.currentLanguage.set(lang);
    }
}
