import { BricklinkPiece } from './bricklink';

export interface StoreSearchItem {
    itemName: string;
    invID: number;
    invQty: number;
    itemType: string;
    invNew: string;
    colorID: number;
    colorName: string;
    itemNo: string;
    itemID: number;
    smallImg: string;
    invPrice: string;
    rawConvertedPrice: number;
}

export interface StoreSearchGroup {
    total: number;
    items: StoreSearchItem[];
}

export interface StoreSearchResponse {
    result?: {
        groups: StoreSearchGroup[];
    };
    returnCode?: number;
}

export interface StoreCartAddEntry {
    invID: number;
    quantity: number;
    storeName: string;
    price: number;
}

export interface PieceSourcingResult {
    piece: BricklinkPiece;
    colorID: number | null;
    remainingQty: number;
    addedFrom: StoreCartAddEntry[];
}

export interface StoreAutomationResult {
    sourced: PieceSourcingResult[];
    missing: PieceSourcingResult[];
    log: string[];
}

export interface AddToCartItemStatus {
    invID: number;
    code: string;
    msg: string;
    sid: number;
}

export interface AddToCartResponse {
    errors: number;
    itemReturnStatus: AddToCartItemStatus[];
    returnCode: number;
    returnMessage: string;
}
