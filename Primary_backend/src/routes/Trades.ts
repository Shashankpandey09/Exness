import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { redisClient } from "..";
import { authMiddleware, AuthRequest } from "../middleware/auth";
export const tradeRouter = Router()



tradeRouter.post('/trade/open', authMiddleware, async (req: AuthRequest, res: Response) => {
    const { type, quantity, symbol, leverage } = req.body
    const userId = req.userId
    const tradeId = uuidv4()
    const payload = {
        type: 'open_ORDER',
        payload: {
            type, symbol, quantity, leverage, userId, tradeId
        }
    }
    await redisClient.xAdd("trades", "*", { data: JSON.stringify(payload) })

})
tradeRouter.post('/trade/close', authMiddleware, async (req: AuthRequest, res: Response) => {
    const { tradeId } = req.body
    const userId = req.userId
    const payload = {
        type: 'close_ORDER',
        payload: {
            tradeId, userId
        }
    }
    await redisClient.xAdd("trades", "*", { data: JSON.stringify(payload) })

})