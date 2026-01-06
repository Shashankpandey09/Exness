import { createClient, RedisClientType } from "redis";

class RedisManager {
    private static instance: RedisManager;
    private mainClient: RedisClientType | null = null;
    private subscriberClient: RedisClientType | null = null;
    private isConnected: boolean = false;

    private constructor() { }

    public static getInstance(): RedisManager {
        if (!RedisManager.instance) {
            RedisManager.instance = new RedisManager();
        }
        return RedisManager.instance;
    }

    async connect(): Promise<void> {
        if (this.isConnected) return;

        const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

        this.mainClient = createClient({ url: redisUrl });
        this.mainClient.on("error", (err) => console.error("Redis Main Client Error:", err));
        await this.mainClient.connect();

        this.subscriberClient = createClient({ url: redisUrl });
        this.subscriberClient.on("error", (err) => console.error("Redis Subscriber Client Error:", err));
        await this.subscriberClient.connect();

        this.isConnected = true;
        console.log("✅ Redis clients connected");
    }

    getMainClient(): RedisClientType {
        if (!this.mainClient) {
            throw new Error("Redis main client not connected. Call connect() first.");
        }
        return this.mainClient;
    }

    getSubscriberClient(): RedisClientType {
        if (!this.subscriberClient) {
            throw new Error("Redis subscriber client not connected. Call connect() first.");
        }
        return this.subscriberClient;
    }

    async waitForTradeResponse(tradeId: string, timeoutMs: number = 5000): Promise<TradeResponse> {
        const channel = `trade_response:${tradeId}`;
        const subscriber = this.getSubscriberClient();

        return new Promise((resolve, reject) => {
            let timeoutId: NodeJS.Timeout;
            let resolved = false;

            const cleanup = async () => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeoutId);
                    try {
                        await subscriber.unsubscribe(channel);
                    } catch (err) { }
                }
            };

            timeoutId = setTimeout(async () => {
                await cleanup();
                reject(new Error(`Trade response timeout after ${timeoutMs}ms`));
            }, timeoutMs);

            subscriber.subscribe(channel, async (message) => {
                try {
                    const response = JSON.parse(message) as TradeResponse;
                    await cleanup();
                    resolve(response);
                } catch (err) {
                    await cleanup();
                    reject(new Error("Failed to parse trade response"));
                }
            }).catch(async (err) => {
                await cleanup();
                reject(err);
            });
        });
    }

    async disconnect(): Promise<void> {
        if (this.mainClient) {
            await this.mainClient.quit();
            this.mainClient = null;
        }
        if (this.subscriberClient) {
            await this.subscriberClient.quit();
            this.subscriberClient = null;
        }
        this.isConnected = false;
        console.log("Redis clients disconnected");
    }
}

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

export { RedisManager };
