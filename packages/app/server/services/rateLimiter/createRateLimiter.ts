import { db } from "@@/server/db";
import { RATE_LIMITER_DURATION_SECONDS } from "@@/server/services/rateLimiter/constants";
import { rateLimiterFlexible } from "@esposter/db-schema";
import { RateLimiterDrizzleNonAtomic } from "rate-limiter-flexible";

// Every limiter is the same counter table on the same window; what a limiter actually decides is its budget,
// Its keyspace and whether an exhausted caller is locked out — so those are all a call site states
export const createRateLimiter = (
  options: Pick<ConstructorParameters<typeof RateLimiterDrizzleNonAtomic>[0], "blockDuration" | "keyPrefix" | "points">,
): RateLimiterDrizzleNonAtomic =>
  new RateLimiterDrizzleNonAtomic({
    duration: RATE_LIMITER_DURATION_SECONDS,
    schema: rateLimiterFlexible,
    storeClient: db,
    ...options,
  });
