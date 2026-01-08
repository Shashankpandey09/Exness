import { createClient, RedisClientType } from "redis";

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

type ResponseResolver = (response: TradeResponse) => void;
type ResponseRejector = (error: Error) => void;

interface Waiter {
    resolve: ResponseResolver;
    reject: ResponseRejector;
    timeout: NodeJS.Timeout;
}

class RedisManager {
    private static instance: RedisManager;
    private mainClient: RedisClientType | null = null;
    private isConnected: boolean = false;
    private waiters: Map<string, Waiter> = new Map();
    private consumerRunning: boolean = false;

    private readonly STREAM_KEY = "trade_responses";
    private readonly GROUP_NAME = "primary_backend_group";
    private readonly CONSUMER_NAME = `consumer_${process.pid}`;

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
        this.mainClient.on("error", (err) => console.error("Redis Client Error:", err));
        await this.mainClient.connect();

        await this.ensureConsumerGroup();
        this.startConsumerLoop();

        this.isConnected = true;
        console.log("Redis client connected");
    }

    private async ensureConsumerGroup(): Promise<void> {
        const client = this.getMainClient();
        try {
            await client.xGroupCreate(this.STREAM_KEY, this.GROUP_NAME, "0", { MKSTREAM: true });
            console.log(`Consumer group ${this.GROUP_NAME} created`);
        } catch (err: any) {
            if (err.message?.includes("BUSYGROUP")) {
                console.log(`Consumer group ${this.GROUP_NAME} already exists`);
            } else {
                throw err;
            }
        }
    }

    private async startConsumerLoop(): Promise<void> {
        if (this.consumerRunning) return;
        this.consumerRunning = true;

        const client = this.getMainClient();

        while (this.consumerRunning) {
            try {
                const result = await client.xReadGroup(
                    this.GROUP_NAME,
                    this.CONSUMER_NAME,
                    { key: this.STREAM_KEY, id: ">" },
                    { BLOCK: 5000, COUNT: 10 }
                );

                if (!result || result.length === 0) continue;

                for (const stream of result) {
                    for (const msg of stream.messages) {
                        try {
                            const response = JSON.parse(msg.message.data) as TradeResponse;
                            const waiter = this.waiters.get(response.tradeId);

                            if (waiter) {
                                clearTimeout(waiter.timeout);
                                waiter.resolve(response);
                                this.waiters.delete(response.tradeId);
                            }

                            await client.xAck(this.STREAM_KEY, this.GROUP_NAME, msg.id);
                        } catch (parseErr) {
                            console.error("Failed to parse response message:", parseErr);
                            await client.xAck(this.STREAM_KEY, this.GROUP_NAME, msg.id);
                        }
                    }
                }
            } catch (err) {
                if (this.consumerRunning) {
                    console.error("Consumer loop error:", err);
                    await new Promise((r) => setTimeout(r, 1000));
                }
            }
        }
    }

    getMainClient(): RedisClientType {
        if (!this.mainClient) {
            throw new Error("Redis client not connected. Call connect() first.");
        }
        return this.mainClient;
    }

    waitForTradeResponse(tradeId: string, timeoutMs: number = 5000): Promise<TradeResponse> {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.waiters.delete(tradeId);
                reject(new Error(`Trade response timeout after ${timeoutMs}ms`));
            }, timeoutMs);

            this.waiters.set(tradeId, { resolve, reject, timeout });
        });
    }

    async disconnect(): Promise<void> {
        this.consumerRunning = false;

        for (const [tradeId, waiter] of this.waiters) {
            clearTimeout(waiter.timeout);
            waiter.reject(new Error("Redis disconnecting"));
        }
        this.waiters.clear();

        if (this.mainClient) {
            await this.mainClient.quit();
            this.mainClient = null;
        }
        this.isConnected = false;
        console.log("Redis client disconnected");
    }
}

export { RedisManager };
