import { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";
import { RATE_LIMITER_DURATION_SECONDS } from "@@/server/services/rateLimiter/constants";
import { createRateLimiter } from "@@/server/services/rateLimiter/createRateLimiter";

// Its own keyspace, for the reason standardRateLimiter records: both procedure limiters key an authed caller on
// The bare user id, so a shared prefix would spend one budget out of the other
export const slowRateLimiter = createRateLimiter({
  blockDuration: RATE_LIMITER_DURATION_SECONDS,
  keyPrefix: RateLimiterType.Slow,
  points: 100,
});
