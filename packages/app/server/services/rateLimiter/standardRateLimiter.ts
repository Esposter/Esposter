import { db } from "@@/server/db";
import { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";
import { rateLimiterFlexible } from "@esposter/db-schema";
import { RateLimiterDrizzleNonAtomic } from "rate-limiter-flexible";

// Its own keyspace: every limiter here shares one table, and an authed caller's key is the bare user id on both
// Procedure limiters, so without a prefix the two budgets are one counter row and slow procedures 429 on the
// Standard budget's spend
export const standardRateLimiter = new RateLimiterDrizzleNonAtomic({
  blockDuration: 60,
  duration: 60,
  keyPrefix: RateLimiterType.Standard,
  points: 1000,
  schema: rateLimiterFlexible,
  storeClient: db,
});
