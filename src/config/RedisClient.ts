import Redis from "ioredis";
import { config } from "dotenv";

config();

const RedisClient = new Redis({
  lazyConnect: true,
  host: process.env.REDIS_HOST ?? "MISSING HOST",
  password: process.env.REDIS_PASS ?? "MISSING PASS",
  port: parseInt(process.env.REDIS_PORT ?? "MISSING PORT"),
});

RedisClient.on("error", (error) => {
  console.error("Redis client error: ", error);
});

export default RedisClient;
