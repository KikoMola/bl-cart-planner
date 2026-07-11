import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class BricklinkAuth {
    private readonly STORAGE_KEY = 'blcpl-session-cookie';

    private cookie = signal<string>(this.readStoredCookie());

    getCookie(): string {
        return this.cookie();
    }

    hasCookie(): boolean {
        return this.cookie().trim().length > 0;
    }

    setCookie(value: string): void {
        const trimmed = (value || '').trim();
        this.cookie.set(trimmed);

        try {
            if (trimmed) {
                sessionStorage.setItem(this.STORAGE_KEY, trimmed);
            } else {
                sessionStorage.removeItem(this.STORAGE_KEY);
            }
        } catch (error) {
            // sessionStorage no disponible (modo privado, etc.): mantener solo en memoria
        }
    }

    clearCookie(): void {
        this.setCookie('');
    }

    private readStoredCookie(): string {
        try {
            return sessionStorage.getItem(this.STORAGE_KEY) || '';
        } catch (error) {
            return '';
        }
    }
}
