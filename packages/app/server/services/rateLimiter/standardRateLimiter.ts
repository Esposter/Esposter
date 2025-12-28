import { db } from "@@/server/db";
import { rateLimiterFlexible } from "@esposter/db-schema";
import { RateLimiterDrizzleNonAtomic } from "rate-limiter-flexible";

export const standardRateLimiter = new RateLimiterDrizzleNonAtomic({
  blockDuration: 100,
  duration: 10,
  points: 100,
  schema: rateLimiterFlexible,
  storeClient: db,
});
