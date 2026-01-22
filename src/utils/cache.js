import Redis from "ioredis";
import "dotenv/config";

let redisClient = null;

const getRedisClient = () => {
  if (!redisClient) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    redisClient.on("connect", () => {
      console.log("Redis Client Connected");
    });
  }
  return redisClient;
};

const cacheService = {
  async get(key) {
    try {
      const client = getRedisClient();
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  },

  async set(key, value, ttl = 3600) {
    try {
      const client = getRedisClient();
      // ioredis supports set with EX option via object in v4+, but safer to use setex
      await client.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Cache set error:", error);
      return false;
    }
  },

  async del(key) {
    try {
      const client = getRedisClient();
      await client.del(key);
      return true;
    } catch (error) {
      console.error("Cache delete error:", error);
      return false;
    }
  },

  async delPattern(pattern) {
    try {
      const client = getRedisClient();
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
      }
      return true;
    } catch (error) {
      console.error("Cache delete pattern error:", error);
      return false;
    }
  },

  async flushAll() {
    try {
      const client = getRedisClient();
      await client.flushall();
      return true;
    } catch (error) {
      console.error("Cache flush error:", error);
      return false;
    }
  },

  async close() {
    try {
      if (redisClient) {
        await redisClient.quit();
        redisClient = null;
      }
    } catch (error) {
      console.error("Cache close error:", error);
    }
  },
};

export default cacheService;
