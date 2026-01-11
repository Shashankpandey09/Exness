import { createClient } from "redis";
import { PriceStoreManager } from "./utils/PriceStore";
import { TradeStoreManager } from "./utils/TradeStore";
import { User } from "./utils/UserBalanceStore";
import { Calc, calculatePnl } from "./utils/CalculateMargin";
import { lastProcessedId } from "./utils/ProcessedID";
import { insertAsset } from "./services/createAsset";
import {
  MessageType,
  PriceUpdateMessage,
  OpenOrderMessage,
  CloseOrderMessage,
} from "./types";
import { liquidation } from "./services/Liquidation";
import { snapshots } from "./services/Snapshot";
import {
  publishTradeResponse,
  createSuccessResponse,
  createFailureResponse,
} from "./utils/ResponsePublisher";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
export const EngineClient = createClient({ url: redisUrl });

function parseMessage(msg: any): MessageType | null {
  try {
    return JSON.parse(msg.message.data) as MessageType;
  } catch (e) {
    console.error("Invalid JSON:", e);
    return null;
  }
}

function handlePriceUpdate(data: PriceUpdateMessage): void {
  if (!data.price_updates) return;
  PriceStoreManager.getInstance().set(data.price_updates);
}

async function handleOpenOrder(data: OpenOrderMessage, id: string): Promise<void> {
  const { symbol, tradeId, type, quantity, userId, leverage } = data.payload;
  const currentPrice = PriceStoreManager.getInstance().get(symbol);

  if (!currentPrice) {
    console.log(`No price for symbol ${symbol}`);
    await publishTradeResponse(
      createFailureResponse(tradeId, `No price available for symbol ${symbol}`)
    );
    return;
  }

  const openPrice =
    type === "buy" ? currentPrice.askPrice : currentPrice.sellPrice;

  const balance = User.getInstance().getBalance(userId);
  const margin = Calc(quantity, type, leverage, openPrice);

  if (balance < margin) {
    console.log("Insufficient balance for", tradeId);
    await publishTradeResponse(
      createFailureResponse(
        tradeId,
        `Insufficient balance. Required: ${margin}, Available: ${balance}`
      )
    );
    return;
  }

  TradeStoreManager.getInstance().addOpenTrade(
    symbol,
    tradeId,
    type,
    quantity,
    openPrice,
    leverage,
    userId
  );

  User.getInstance().updateBalance(userId, balance - margin);

  if (!PriceStoreManager.getInstance().getAssetId(symbol)) {
    insertAsset(symbol).catch((err) => console.log(err));
  }

  await publishTradeResponse(
    createSuccessResponse(tradeId, "Trade opened successfully", {
      openPrice,
      margin,
      balance: balance - margin,
    })
  );
}

async function handleCloseOrder(data: CloseOrderMessage, id: string): Promise<void> {
  const { symbol, tradeId, userId, type } = data.payload;
  const currentPrice = PriceStoreManager.getInstance().get(symbol);

  if (!currentPrice) {
    console.log(`No price for symbol ${symbol}`);
    await publishTradeResponse(
      createFailureResponse(tradeId, `No price available for symbol ${symbol}`)
    );
    return;
  }

  const closePrice =
    type === "buy" ? currentPrice.sellPrice : currentPrice.askPrice;

  await TradeStoreManager.getInstance().closeTrade(symbol, tradeId, closePrice);

  const balance = User.getInstance().getBalance(userId);
  const result = calculatePnl(type, balance, tradeId, userId, symbol);

  if (result) {
    const { pnl, newBalance } = result;
    console.log(`Trade ${tradeId} closed. PnL = ${pnl}`);
    User.getInstance().updateBalance(userId, newBalance);

    await publishTradeResponse(
      createSuccessResponse(tradeId, "Trade closed successfully", {
        closePrice,
        pnl,
        balance: newBalance,
      })
    );
  } else {
    await publishTradeResponse(
      createFailureResponse(tradeId, "Failed to close trade. Trade not found or invalid state.")
    );
  }
}

async function handleMessage(data: MessageType, id: string): Promise<void> {
  if (!data?.type) return;

  switch (data.type) {
    case "Price_updates":
      handlePriceUpdate(data);
      break;
    case "open_ORDER":
      await handleOpenOrder(data, id);
      break;
    case "close_ORDER":
      await handleCloseOrder(data, id);
      break;
    case "user_signup":
      User.getInstance().updateBalance(data.payload.user, data.payload.balance);
      break;
    default:
      const exhaustive: never = data;
      console.warn("Unknown message type:", (data as any).type);
      break;
  }
}

async function StartEngine() {
  try {
    await EngineClient.connect();
    console.log("Engine Client connected");
    console.log("trades length:", await EngineClient.xLen("trades"));
    let lastProcessedid = await lastProcessedId
      .getInstance()
      .getLastProcessedId();
    liquidation();
    snapshots();

    while (true) {
      const streamData = await EngineClient.xRead(
        { key: "trades", id: lastProcessedid },
        { BLOCK: 0, COUNT: 10 }
      );

      if (!streamData) continue;
      //@ts-ignore
      for (const stream of streamData) {
        for (const message of stream.messages) {
          console.log(message);
          const id = message.id;
          const data = parseMessage(message);
          if (!data) {
            lastProcessedid = id;
            lastProcessedId.getInstance().setLastProcessedId(lastProcessedid);
            continue;
          }

          await handleMessage(data, id);
          lastProcessedid = id;
          lastProcessedId.getInstance().setLastProcessedId(lastProcessedid);
          await EngineClient.set(
            "lastProcessedStreamId",
            JSON.stringify(lastProcessedid)
          );
          console.log("done");
        }
      }
    }
  } catch (error) {
    console.error("Engine error:", error);
  }
}

StartEngine();
