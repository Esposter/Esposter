import { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";
import { slowRateLimiter } from "@@/server/services/rateLimiter/slowRateLimiter";
import { standardRateLimiter } from "@@/server/services/rateLimiter/standardRateLimiter";
import { RateLimiterDrizzleNonAtomic } from "rate-limiter-flexible";

export const RateLimiterMap = {
  [RateLimiterType.Slow]: slowRateLimiter,
  [RateLimiterType.Standard]: standardRateLimiter,
} as const satisfies Record<RateLimiterType, RateLimiterDrizzleNonAtomic>;
