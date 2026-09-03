import type { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";

import { IS_PRODUCTION } from "#shared/util/environment/constants";
import { auth } from "@@/server/auth";
import { checkIsRateLimitExceeded } from "@@/server/services/rateLimiter/checkIsRateLimitExceeded";
import { RATE_LIMITER_BYPASS_LOG_MESSAGE } from "@@/server/services/rateLimiter/constants";
import { RateLimiterMap } from "@@/server/services/rateLimiter/RateLimiterMap";
import { getIpAddress } from "@@/server/services/request/getIpAddress";
import { middleware } from "@@/server/trpc";
import { getResultAsync, ID_SEPARATOR } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const getRateLimitedMiddleware = (type: RateLimiterType) =>
  middleware(async ({ ctx, next, path }) => {
    const getSessionPayload = await auth.api.getSession({ headers: ctx.headers });
    if (!IS_PRODUCTION) return next({ ctx: { getSessionPayload } });

    const ipAddress = getIpAddress(ctx.req);
    if (!getSessionPayload && !ipAddress) {
      console.warn(RATE_LIMITER_BYPASS_LOG_MESSAGE);
      return next({ ctx: { getSessionPayload } });
    }

    const rateLimiter = RateLimiterMap[type];
    const rateLimiterResult = await getResultAsync(() =>
      rateLimiter.consume(getSessionPayload ? getSessionPayload.user.id : `${path}${ID_SEPARATOR}${ipAddress}`),
    );
    const { msBeforeNext, remainingPoints } = rateLimiterResult.match(
      (result) => result,
      (error) => {
        if (checkIsRateLimitExceeded(error)) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      },
    );
    if ("setHeader" in ctx.res) {
      ctx.res.setHeader(
        "Retry-After",
        Math.ceil(Temporal.Duration.from({ milliseconds: msBeforeNext }).total("seconds")),
      );
      ctx.res.setHeader("X-RateLimit-Limit", rateLimiter.points);
      ctx.res.setHeader("X-RateLimit-Remaining", remainingPoints);
      ctx.res.setHeader("X-RateLimit-Reset", new Date(Date.now() + msBeforeNext).toISOString());
    }

    return next({ ctx: { getSessionPayload } });
  });
