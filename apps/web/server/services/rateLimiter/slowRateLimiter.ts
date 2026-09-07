import { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";
import { RATE_LIMITER_DURATION_SECONDS } from "@@/server/services/rateLimiter/constants";
import { createRateLimiter } from "@@/server/services/rateLimiter/createRateLimiter";

// The tighter budget a procedure opts into, keyed on the same authed caller the standard one is
export const slowRateLimiter = createRateLimiter({
  blockDuration: RATE_LIMITER_DURATION_SECONDS,
  keyPrefix: RateLimiterType.Slow,
  points: 100,
});
