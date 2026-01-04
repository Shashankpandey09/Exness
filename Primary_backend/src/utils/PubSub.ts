import { createClient, RedisClientType } from "redis";

let publisherClient: RedisClientType | null = null;
let subscriberClient: RedisClientType | null = null;

export async function startPublisher() {
  if (!publisherClient) {
    publisherClient = createClient();
    publisherClient.on("error", (e) => console.error("Publisher redis error", e));
    await publisherClient.connect();
  }
  return publisherClient;
}

export async function startSubscriber() {
  if (!subscriberClient) {
    subscriberClient = createClient();
    subscriberClient.on("error", (e) => console.error("Subscriber redis error", e));
    await subscriberClient.connect();
  }
  return subscriberClient;
}