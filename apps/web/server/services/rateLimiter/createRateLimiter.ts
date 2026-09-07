import type { SetRequired } from "type-fest";

import { db } from "@@/server/db";
import { RATE_LIMITER_DURATION_SECONDS } from "@@/server/services/rateLimiter/constants";
import { rateLimiterFlexible } from "@esposter/db-schema";
import { RateLimiterDrizzleNonAtomic } from "rate-limiter-flexible";

// Every limiter is the same counter table on the same window, so what a limiter actually decides is its budget,
// Its keyspace and whether an exhausted caller is locked out — those are all a call site states. `keyPrefix` is
// Required rather than optional because the shared table makes it a correctness invariant, not a nicety: two
// Limiters that leave it unset land on one counter row for every key they happen to share, and the budget that
// Spends first refuses calls that belong to the other. Making it a parameter is what stops a new limiter from
// Inheriting that by omission
export const createRateLimiter = (
  options: SetRequired<
    Pick<ConstructorParameters<typeof RateLimiterDrizzleNonAtomic>[0], "blockDuration" | "keyPrefix" | "points">,
    "keyPrefix"
  >,
): RateLimiterDrizzleNonAtomic =>
  new RateLimiterDrizzleNonAtomic({
    duration: RATE_LIMITER_DURATION_SECONDS,
    schema: rateLimiterFlexible,
    storeClient: db,
    ...options,
  });
