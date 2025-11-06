import { BricklinkPiece } from './bricklink';

export interface SavedCart {
    id: string;
    idItem: number;
    pieces: BricklinkPiece[];
    savedAt: number;
}
