import { db } from "@@/server/db";
import { rateLimiterFlexible } from "@esposter/db-schema";
import { RateLimiterDrizzleNonAtomic } from "rate-limiter-flexible";

export const slowRateLimiter = new RateLimiterDrizzleNonAtomic({
  blockDuration: 60,
  duration: 60,
  points: 100,
  schema: rateLimiterFlexible,
  storeClient: db,
});
