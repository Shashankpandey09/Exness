import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { redisClient } from "..";
import { AuthRequest } from "../middleware/auth";
export const tradeRouter = Router()



tradeRouter.post('/trade/open', async (req: AuthRequest, res: Response) => {
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