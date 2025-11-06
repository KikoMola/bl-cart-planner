import { Injectable } from '@angular/core';
import { SavedCart } from '../interfaces/cart';
import { BricklinkPiece } from '../interfaces/bricklink';

@Injectable({
    providedIn: 'root',
})
export class CartStorage {
    private readonly STORAGE_KEY = 'blcpl-carts';
    private readonly MAX_CARTS = 10; // Límite de carritos guardados

    saveCart(idItem: number, pieces: BricklinkPiece[], name?: string): string {
        const carts = this.getAllCarts();

        // Crear ID único basado en timestamp
        const cartId = `cart-${Date.now()}`;

        // Optimizar datos: solo guardar campos necesarios
        const optimizedPieces = pieces.map(piece => ({
            d: piece.description,
            i: piece.itemNo,
            q: piece.quantity,
            img: piece.imageUrl,
            p: piece.price || undefined,
        }));

        const newCart: SavedCart = {
            id: cartId,
            name: name || undefined,
            idItem,
            pieces: optimizedPieces as any,
            savedAt: Date.now(),
        };

        // Agregar al inicio del array
        carts.unshift(newCart);

        // Mantener solo los últimos MAX_CARTS
        if (carts.length > this.MAX_CARTS) {
            carts.splice(this.MAX_CARTS);
        }

        this.saveCarts(carts);
        return cartId;
    }

    updateCart(cartId: string, pieces: BricklinkPiece[], name?: string): void {
        const carts = this.getAllCarts();
        const cartIndex = carts.findIndex(c => c.id === cartId);

        if (cartIndex === -1) {
            // Si no existe, crear uno nuevo
            this.saveCart(0, pieces, name); // idItem será ignorado si se encuentra el cart
            return;
        }

        // Optimizar datos: solo guardar campos necesarios
        const optimizedPieces = pieces.map(piece => ({
            d: piece.description,
            i: piece.itemNo,
            q: piece.quantity,
            img: piece.imageUrl,
            p: piece.price || undefined,
        }));

        // Actualizar el carrito existente
        carts[cartIndex] = {
            ...carts[cartIndex],
            name: name || undefined,
            pieces: optimizedPieces as any,
            savedAt: Date.now(), // Actualizar fecha
        };

        this.saveCarts(carts);
    }

    getAllCarts(): SavedCart[] {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading carts from localStorage:', error);
            return [];
        }
    }

    getCart(cartId: string): SavedCart | null {
        const carts = this.getAllCarts();
        return carts.find(cart => cart.id === cartId) || null;
    }

    deleteCart(cartId: string): void {
        const carts = this.getAllCarts().filter(cart => cart.id !== cartId);
        this.saveCarts(carts);
    }

    private saveCarts(carts: SavedCart[]): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(carts));
        } catch (error) {
            console.error('Error saving carts to localStorage:', error);
            // Si falla por límite de espacio, eliminar el carrito más antiguo y reintentar
            if (carts.length > 1) {
                carts.pop();
                this.saveCarts(carts);
            }
        }
    }

    // Obtener tamaño aproximado del storage usado (en KB)
    getStorageSize(): number {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? new Blob([data]).size / 1024 : 0;
    }
}
