
export interface AssetData {
    asset: string;
    price: number;
    decimals: number;
}


export interface AssetMapType {
    symbol: string;
    askPrice: number;
    sellPrice: number;
    decimal: number;
}



export type TradeType = "buy" | "sell";
export type TradeStatus = "open" | "closed";


export interface Trade {
    tradeId: string;
    type: TradeType;
    quantity: number;
    openPrice: number;
    status: TradeStatus;
    leverage: number;
    userId: number;
    closedPrice?: number;
    streamId?: string;
    symbol: string;
    pnl?: number;
    margin?: number;
    liquidated?: boolean;
}

export interface PriceUpdateMessage {
    type: "Price_updates";
    price_updates: AssetData[];
}



export interface OpenOrderPayload {
    type: TradeType;
    symbol: string;
    quantity: number;
    leverage: number;
    userId: number;
    tradeId: string;
}

export interface OpenOrderMessage {
    type: "open_ORDER";
    payload: OpenOrderPayload;
}

export interface CloseOrderPayload {
    type: TradeType;
    symbol: string;
    tradeId: string;
    userId: number;
}

export interface CloseOrderMessage {
    type: "close_ORDER";
    payload: CloseOrderPayload;
}

export interface UserSignupPayload {
    user: number;      // userId
    balance: number;   // usd_balance
}

export interface UserSignupMessage {
    type: "user_signup";
    payload: UserSignupPayload;
}



export type MessageType =
    | PriceUpdateMessage
    | OpenOrderMessage
    | CloseOrderMessage
    | UserSignupMessage;



export interface UserType {
    userId: number;
    usd_balance: number;
}
