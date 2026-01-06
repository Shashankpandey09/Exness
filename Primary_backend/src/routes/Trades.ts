import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { redisManager, getRedisClient } from "..";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { TradeResponse } from "../utils/RedisManager";

export const tradeRouter = Router();

const TRADE_RESPONSE_TIMEOUT = 5000;

tradeRouter.post(
    "/trade/open",
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
        const { type, quantity, symbol, leverage } = req.body;
        const userId = req.userId;

        if (!type || !quantity || !symbol || !leverage) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: type, quantity, symbol, leverage",
            });
        }

        if (type !== "buy" && type !== "sell") {
            return res.status(400).json({
                success: false,
                message: 'Trade type must be "buy" or "sell"',
            });
        }

        if (quantity <= 0 || leverage <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity and leverage must be positive numbers",
            });
        }

        const tradeId = uuidv4();

        const payload = {
            type: "open_ORDER",
            payload: {
                type,
                symbol,
                quantity,
                leverage,
                userId,
                tradeId,
            },
        };

        try {
            await getRedisClient().xAdd("trades", "*", {
                data: JSON.stringify(payload),
            });

            const response = await redisManager.waitForTradeResponse(
                tradeId,
                TRADE_RESPONSE_TIMEOUT
            );

            if (response.success) {
                return res.status(201).json({
                    success: true,
                    message: "Trade opened successfully",
                    tradeId: tradeId,
                    data: response.data,
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: response.message || "Failed to open trade",
                    tradeId: tradeId,
                });
            }
        } catch (error: any) {
            if (error.message?.includes("timeout")) {
                return res.status(504).json({
                    success: false,
                    message: "Trade request timed out. Please try again or check your trade history.",
                    tradeId: tradeId,
                });
            }

            console.error("Trade open error:", error);
            return res.status(500).json({
                success: false,
                message: "An error occurred while processing your trade request",
            });
        }
    }
);

tradeRouter.post(
    "/trade/close",
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
        const { tradeId, symbol, type } = req.body;
        const userId = req.userId;

        if (!tradeId) {
            return res.status(400).json({
                success: false,
                message: "Missing required field: tradeId",
            });
        }

        const payload = {
            type: "close_ORDER",
            payload: {
                tradeId,
                userId,
                symbol,
                type,
            },
        };

        try {
            await getRedisClient().xAdd("trades", "*", {
                data: JSON.stringify(payload),
            });

            const response = await redisManager.waitForTradeResponse(
                tradeId,
                TRADE_RESPONSE_TIMEOUT
            );

            if (response.success) {
                return res.status(200).json({
                    success: true,
                    message: "Trade closed successfully",
                    tradeId: tradeId,
                    data: response.data,
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: response.message || "Failed to close trade",
                    tradeId: tradeId,
                });
            }
        } catch (error: any) {
            if (error.message?.includes("timeout")) {
                return res.status(504).json({
                    success: false,
                    message: "Trade close request timed out. Please check your trade history.",
                    tradeId: tradeId,
                });
            }

            console.error("Trade close error:", error);
            return res.status(500).json({
                success: false,
                message: "An error occurred while processing your trade close request",
            });
        }
    }
);

tradeRouter.get(
    "/trade/positions",
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
        const userId = req.userId;

        return res.status(200).json({
            success: true,
            message: "Open positions endpoint",
            userId: userId,
            positions: [],
        });
    }
);