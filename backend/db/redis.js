import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const rateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

const rateLimitEmail = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(1, "60 s"),
});

export const checkLimit = async (identifier) => {
  return await rateLimit.limit(identifier);
};

export const checkLimitEmail = async (identifier) => {
  return await rateLimitEmail.limit(identifier);
};
