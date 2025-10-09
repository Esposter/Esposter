import { db } from "@/services/db";
import { rateLimiterFlexible } from "@esposter/db";
import { RateLimiterDrizzleNonAtomic } from "rate-limiter-flexible";

export const rateLimiter: RateLimiterDrizzleNonAtomic = new RateLimiterDrizzleNonAtomic({
  blockDuration: 60,
  duration: 60,
  points: 30,
  schema: rateLimiterFlexible,
  storeClient: db,
});
