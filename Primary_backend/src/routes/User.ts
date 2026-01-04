import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import dotenv from 'dotenv';

import { redisClient } from "..";
import { sendMagicLinkEmail } from "../utils/SendEmail";

dotenv.config();

export const UserRouter = Router();
const SECRET_KEY = process.env.SECRET_KEY as string;


UserRouter.post("/signup", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { username: email } });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database (unverified initially)
    const user = await prisma.user.create({
      data: {
        username: email,
        lastLoggedIn: new Date(),
        usd_balance: 5000,
      },
      select: { id: true, usd_balance: true },
    });

    // Generate magic link token
    const token = jwt.sign({ email, userId: user.id, type: 'signup_verification' }, SECRET_KEY, { expiresIn: '1h' });

    // Send magic link email
    const emailResult = await sendMagicLinkEmail(token, email);
    if (!emailResult) {
      console.warn("Failed to send verification email, but user was created");
    }

    // Push to Redis streams
    const args = ['XADD', 'trades', '*', 'user', `${user.id}`, 'balance', `${user.usd_balance}`];
    const streamId = await redisClient.sendCommand(args);
    console.log("Redis stream ID:", streamId);

    return res.status(201).json({
      message: "User created successfully. Please check your email to verify your account.",
      id: user.id,
      balance: user.usd_balance,
      emailSent: !!emailResult,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Error occurred while creating user" });
  }
});

UserRouter.post("/signin", async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { username: email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate magic link token
    const token = jwt.sign({ email, userId: user.id, type: 'signin_verification' }, SECRET_KEY, { expiresIn: '1h' });

    // Send magic link email
    const emailResult = await sendMagicLinkEmail(token, email);
    if (!emailResult) {
      return res.status(500).json({ message: "Failed to send verification email" });
    }

    return res.status(200).json({
      message: "Verification email sent to your email. Please check your inbox.",
      emailSent: true,
    });
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({ message: "Error occurred during signin" });
  }
});


UserRouter.get("/verify", async (req: Request, res: Response) => {
  const token = req.query.token as string;

  if (!token) {
    return res.status(400).json({ error: "Token is missing" });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, SECRET_KEY) as {
      email: string;
      userId: number;
      type: string;
    };

    console.log("Token verified successfully for:", decoded.email);

    // Find the user
    const user = await prisma.user.findUnique({ where: { username: decoded.email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a session token for the authenticated user
    const sessionToken = jwt.sign(
      { userId: user.id, email: decoded.email },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    // You can redirect to your frontend with the session token
    // For now, return the success response with the token
    return res.status(200).json({
      message: "Email verified successfully!",
      verified: true,
      userId: user.id,
      sessionToken: sessionToken,
    });

    // Alternatively, redirect to frontend:
    // return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${sessionToken}`);

  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});
