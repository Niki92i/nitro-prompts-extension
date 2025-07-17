import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Create a new ratelimiter that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

export async function rateLimit(
  request: NextRequest,
  identifier: string
): Promise<NextResponse | null> {
  const ip = request.ip ?? "127.0.0.1";
  const { success, limit, reset, remaining } = await ratelimit.limit(
    `${identifier}_${ip}`
  );

  if (!success) {
    return NextResponse.json(
      {
        error: "Too many requests",
        limit,
        reset,
        remaining,
      },
      { status: 429 }
    );
  }

  return null;
} 