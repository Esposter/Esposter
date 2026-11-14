import type { RateLimiterType } from "#server/models/rateLimiter/RateLimiterType";

import { RATE_LIMITER_BYPASS_LOG_MESSAGE } from "#server/services/rateLimiter/constants";
import { RateLimiterMap } from "#server/services/rateLimiter/RateLimiterMap";
import { sessionMiddleware } from "#server/trpc/middleware/sessionMiddleware";
import { IS_PRODUCTION } from "#shared/util/environment/constants";
import { ID_SEPARATOR } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { env } from "cloudflare:workers";

// A rate limit binding answers only whether a key is within its budget, so a refusal is the whole answer: the points left and
// The time to the reset are not known to the Worker, and no rate limit header is written
export const getRateLimitedMiddleware = (type: RateLimiterType) =>
  sessionMiddleware.unstable_pipe(async ({ ctx: { ipAddress, user }, next, path }) => {
    if (!IS_PRODUCTION) return next();

    if (!user && !ipAddress) {
      console.warn(RATE_LIMITER_BYPASS_LOG_MESSAGE);
      return next();
    }

    const { success } = await env[RateLimiterMap[type]].limit({
      key: user ? user.id : `${path}${ID_SEPARATOR}${ipAddress}`,
    });
    if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

    return next();
  });
