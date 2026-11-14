import { RateLimiterType } from "#server/models/rateLimiter/RateLimiterType";
import { RateLimiterBinding } from "@esposter/db-schema";

// The binding each procedure budget is served by. Keyed by the enum, so a new budget fails to compile until it has one
export const RateLimiterMap = {
  [RateLimiterType.Slow]: RateLimiterBinding.Slow,
  [RateLimiterType.Standard]: RateLimiterBinding.Standard,
} as const satisfies Record<RateLimiterType, RateLimiterBinding>;
