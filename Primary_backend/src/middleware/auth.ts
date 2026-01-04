import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export interface AuthRequest extends Request {
    userId?: number;
}

const SECRET_KEY = process.env.SECRET_KEY as string;

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authorization header missing or invalid" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY) as { userId: number; email: string, type: 'signin_verification' | 'signup_verification' };
        req.userId = decoded.userId;
        next();
    } catch (err) {
        console.error("Token verification failed:", err);
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}
