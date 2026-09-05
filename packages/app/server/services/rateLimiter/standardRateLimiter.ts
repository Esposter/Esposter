import { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";
import { RATE_LIMITER_DURATION_SECONDS } from "@@/server/services/rateLimiter/constants";
import { createRateLimiter } from "@@/server/services/rateLimiter/createRateLimiter";

// The budget every procedure spends from unless it is declared slow
export const standardRateLimiter = createRateLimiter({
  blockDuration: RATE_LIMITER_DURATION_SECONDS,
  keyPrefix: RateLimiterType.Standard,
  points: 1000,
});
