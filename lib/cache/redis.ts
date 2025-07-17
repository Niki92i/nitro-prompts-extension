import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function getCachedResponse(key: string): Promise<string | null> {
  try {
    return await redis.get(key);
  } catch (error) {
    console.error("Error getting cached response:", error);
    return null;
  }
}

export async function setCachedResponse(
  key: string,
  value: string,
  expirySeconds: number = 3600 // 1 hour default
): Promise<void> {
  try {
    await redis.set(key, value, { ex: expirySeconds });
  } catch (error) {
    console.error("Error setting cached response:", error);
  }
}

export function generateCacheKey(text: string, type: "summary" | "image"): string {
  const hash = require("crypto")
    .createHash("md5")
    .update(text)
    .digest("hex");
  return `${type}_${hash}`;
} 