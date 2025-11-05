export interface BricklinkSearchResponse {
    result: Result;
    returnCode: number;
    returnMessage: string;
    errorTicket: number;
    procssingTime: number;
    strRefNo: string;
}

export interface Result {
    typeList: TypeList[];
    nCustomItemCnt: number;
}

export interface TypeList {
    type: string;
    count: number;
    items: Item[];
}

export interface Item {
    idItem: number;
    typeItem: string;
    strItemNo: string;
    strItemName: string;
    idColor: number;
    idColorImg: number;
    cItemImgTypeS: string;
    bHasLargeImg: boolean;
    n4NewQty: number;
    n4NewSellerCnt: number;
    mNewMinPrice: string;
    mNewMaxPrice: string;
    n4UsedQty: number;
    n4UsedSellerCnt: number;
    mUsedMinPrice: string;
    mUsedMaxPrice: string;
    strCategory: string;
    strPCC: null;
}

export interface BricklinkItem {
    item: Item;
    returnCode: number;
    returnMessage: string;
    errorTicket: number;
    procssingTime: number;
    strRefNo: string;
}

export interface Item {
    typeItem: string;
    strItemName: string;
    strItemNo: string;
    n1Seq: number;
    strItemNoFull: string;
    nYearReleased: number;
    nInvSetCnt: number;
    nInvPartCnt: number;
    nInvMinifigCnt: number;
    nInvBookCnt: number;
    nInvGearCnt: number;
    imglist: Imglist[];
    hasLegacyLarge: boolean;
}

export interface Imglist {
    type: string;
    thumb1_url: string;
    thumb2_url: string;
    main_url: string;
    idColorImg: number;
    typeItem: string;
}

export interface BricklinkPiece {
    description: string;
    itemNo: string;
    quantity: number;
    imageUrl: string;
}
