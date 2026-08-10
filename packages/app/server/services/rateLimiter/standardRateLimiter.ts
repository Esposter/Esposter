import { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";
import { RATE_LIMITER_DURATION_SECONDS } from "@@/server/services/rateLimiter/constants";
import { createRateLimiter } from "@@/server/services/rateLimiter/createRateLimiter";

// Its own keyspace: every limiter here shares one table, and an authed caller's key is the bare user id on both
// Procedure limiters, so without a prefix the two budgets are one counter row and slow procedures 429 on the
// Standard budget's spend
export const standardRateLimiter = createRateLimiter({
  blockDuration: RATE_LIMITER_DURATION_SECONDS,
  keyPrefix: RateLimiterType.Standard,
  points: 1000,
});
