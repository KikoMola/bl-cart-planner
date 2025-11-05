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
