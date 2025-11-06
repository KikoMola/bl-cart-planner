import { BricklinkPiece } from './bricklink';

export interface SavedCart {
    id: string;
    name?: string;
    idItem: number;
    pieces: BricklinkPiece[];
    savedAt: number;
}
