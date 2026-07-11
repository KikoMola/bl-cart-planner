import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Bricklink } from '../../services/bricklink';
import { TableState } from '../../services/table-state';
import { BricklinkAuth } from '../../services/bricklink-auth';
import { StoreAutomation } from '../../services/store-automation';
import { BricklinkPiece } from '../../interfaces/bricklink';

@Component({
    selector: 'app-stores',
    imports: [ReactiveFormsModule, TranslateModule],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './stores.html',
})
export class Stores implements OnInit {
    private router = inject(Router);
    private bricklinkService = inject(Bricklink);
    private tableState = inject(TableState);
    private storeAutomation = inject(StoreAutomation);
    private translateService = inject(TranslateService);
    auth = inject(BricklinkAuth);

    private idItem: number | null = null;

    pieces = signal<BricklinkPiece[]>([]);
    isLoadingPieces = signal(false);
    isRunning = signal(false);
    errorMessage = signal<string | null>(null);
    progressLog = signal<string[]>([]);

    cookieControl = new FormControl(this.auth.getCookie(), { nonNullable: true });

    storesForm = new FormGroup({
        stores: new FormArray<FormControl<string>>([]),
    });

    get storesArray(): FormArray<FormControl<string>> {
        return this.storesForm.get('stores') as FormArray<FormControl<string>>;
    }

    ngOnInit(): void {
        this.idItem = this.tableState.getItemId();

        if (!this.idItem) {
            this.errorMessage.set(this.translateService.instant('stores.noItem'));
            return;
        }

        this.addStore();
        this.loadPieces(this.idItem);
    }

    addStore(): void {
        this.storesArray.push(
            new FormControl('', { nonNullable: true, validators: [Validators.required] })
        );
    }

    removeStore(index: number): void {
        this.storesArray.removeAt(index);
    }

    moveStoreUp(index: number): void {
        if (index === 0) return;
        const control = this.storesArray.at(index);
        this.storesArray.removeAt(index);
        this.storesArray.insert(index - 1, control);
    }

    moveStoreDown(index: number): void {
        if (index === this.storesArray.length - 1) return;
        const control = this.storesArray.at(index);
        this.storesArray.removeAt(index);
        this.storesArray.insert(index + 1, control);
    }

    saveCookie(): void {
        this.auth.setCookie(this.cookieControl.value);
    }

    skipAutomation(): void {
        this.router.navigate(['/table']);
    }

    async runAutomation(): Promise<void> {
        if (this.storesArray.invalid || this.pieces().length === 0 || !this.cookieControl.value.trim()) {
            return;
        }

        this.saveCookie();
        this.isRunning.set(true);
        this.errorMessage.set(null);
        this.progressLog.set([]);

        const storeNames = this.storesArray.controls
            .map(control => control.value.trim())
            .filter(name => name.length > 0);

        try {
            const result = await this.storeAutomation.run(this.pieces(), storeNames, message => {
                this.progressLog.update(log => [...log, message]);
            });

            this.tableState.setAutomationResult(result);
            this.isRunning.set(false);
            this.router.navigate(['/table']);
        } catch (error) {
            this.errorMessage.set(this.translateService.instant('stores.runError'));
            this.isRunning.set(false);
        }
    }

    private loadPieces(idItem: number): void {
        this.isLoadingPieces.set(true);
        this.bricklinkService.getItemInventory(idItem).subscribe({
            next: pieces => {
                this.pieces.set(pieces);
                this.isLoadingPieces.set(false);
            },
            error: () => {
                this.errorMessage.set(this.translateService.instant('stores.loadError'));
                this.isLoadingPieces.set(false);
            },
        });
    }
}
