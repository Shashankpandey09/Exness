import express from "express";
import dotenv from "dotenv";
import { UserRouter } from "./routes/User";
import { tradeRouter } from "./routes/Trades";
import { RedisManager } from "./utils/RedisManager";

dotenv.config();

const app = express();
app.use(express.json());

export const redisManager = RedisManager.getInstance();

export const getRedisClient = () => redisManager.getMainClient();

app.use("/api/v1/user", UserRouter);
app.use("/api/v1", tradeRouter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

async function startServer() {
  try {
    await redisManager.connect();

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start:", error);
    process.exit(1);
  }
}

process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down...");
  await redisManager.disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down...");
  await redisManager.disconnect();
  process.exit(0);
});

startServer();
