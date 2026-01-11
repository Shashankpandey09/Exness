import { PriceStoreManager } from "../utils/PriceStore";
import { prisma } from "../utils/prisma";
import { TradeStoreManager } from "../utils/TradeStore";
import type { Trade } from "../utils/TradeStore";

const CHUNK = 1000;



async function persistClosedTrades() {
  //i need all the trades here , and i need to store the last processed id in the redis cache and fetch it from there
  const closedTrades = TradeStoreManager.getInstance().getAllTrades(); // <- matches TradeStore.ts

  for (const [symbol, trades] of closedTrades) {

    while (trades.length > 0) {
      const batch = trades.splice(0, CHUNK);
      if (batch.length === 0) break;

      const assetId =
        PriceStoreManager.getInstance().getAssetId(symbol) ?? null;


      const payload = batch.map((t: Trade) => ({
        id: t.tradeId,
        symbol: t.symbol ?? symbol,
        openPrice: String(t.openPrice),
        closePrice: String(t.closedPrice ?? 0),
        leverage: t.leverage,
        pnl: String(t.pnl ?? 0),
        streamId: t.streamId ?? "0-0",
        userId: t.userId,
        assetId: assetId ?? "",
        liquidated: false,
        status: t.status,
      }));

      try {
        await prisma.existingTrade.createMany({
          data: payload,
          skipDuplicates: true,
        });

      } catch (err) {
        console.error(`Error persisting batch for ${symbol}:`, err);
        // putting the batch back at the front so next run retries 
        trades.unshift(...batch);

        break;
      }
    }
  }
}


export function snapshots() {
  let running = false
  setInterval(async () => {
    try {
      if (running) return;
      running = true;
      await persistClosedTrades();
      running = false;
    } catch (err) {
      console.error("Snapshot error:", err);
      running = false;
    }
  }, 30_000);
}
