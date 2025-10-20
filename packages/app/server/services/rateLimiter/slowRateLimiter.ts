import { db } from "@@/server/db";
import { rateLimiterFlexible } from "@esposter/db-schema";
import { RateLimiterDrizzleNonAtomic } from "rate-limiter-flexible";

export const slowRateLimiter = new RateLimiterDrizzleNonAtomic({
  blockDuration: 100,
  duration: 100,
  points: 10,
  schema: rateLimiterFlexible,
  storeClient: db,
});
