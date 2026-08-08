import { db } from "@@/server/db";
import { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";
import { rateLimiterFlexible } from "@esposter/db-schema";
import { RateLimiterDrizzleNonAtomic } from "rate-limiter-flexible";

// Its own keyspace, for the reason standardRateLimiter records: both procedure limiters key an authed caller on
// The bare user id, so a shared prefix would spend one budget out of the other
export const slowRateLimiter = new RateLimiterDrizzleNonAtomic({
  blockDuration: 60,
  duration: 60,
  keyPrefix: RateLimiterType.Slow,
  points: 100,
  schema: rateLimiterFlexible,
  storeClient: db,
});
