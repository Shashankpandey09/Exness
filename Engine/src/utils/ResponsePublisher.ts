import { EngineClient } from "..";

export interface TradeResponse {
    success: boolean;
    tradeId: string;
    message: string;
    data?: {
        openPrice?: number;
        closePrice?: number;
        pnl?: number;
        margin?: number;
        balance?: number;
    };
}

const RESPONSE_STREAM = "trade_responses";

export async function publishTradeResponse(response: TradeResponse): Promise<void> {
    try {
        await EngineClient.xAdd(RESPONSE_STREAM, "*", { data: JSON.stringify(response) });
        console.log(`Published response for trade ${response.tradeId}: ${response.success ? "SUCCESS" : "FAILED"}`);
    } catch (error) {
        console.error(`Failed to publish response for trade ${response.tradeId}:`, error);
    }
}

export function createSuccessResponse(
    tradeId: string,
    message: string,
    data?: TradeResponse["data"]
): TradeResponse {
    return {
        success: true,
        tradeId,
        message,
        data,
    };
}

export function createFailureResponse(tradeId: string, message: string): TradeResponse {
    return {
        success: false,
        tradeId,
        message,
    };
}
