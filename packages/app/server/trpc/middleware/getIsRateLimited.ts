import type { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";

import { dayjs } from "#shared/services/dayjs";
import { IS_PRODUCTION } from "#shared/util/environment/constants";
import { auth } from "@@/server/auth";
import { RateLimiterMap } from "@@/server/services/rateLimiter/RateLimiterMap";
import { getIpAddress } from "@@/server/services/request/getIpAddress";
import { middleware } from "@@/server/trpc";
import { getResultAsync, ID_SEPARATOR } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { RateLimiterRes } from "rate-limiter-flexible";

export const getIsRateLimited = (type: RateLimiterType) =>
  middleware(async ({ ctx, next, path }) => {
    const getSessionPayload = await auth.api.getSession({ headers: ctx.headers });
    if (!IS_PRODUCTION) return next({ ctx: { getSessionPayload } });

    const ipAddress = getIpAddress(ctx.req);
    if (!ipAddress) {
      console.warn(
        "[RateLimiter] Could not determine IP address. Bypassing middleware... This is expected for local production builds.",
      );
      return next({ ctx: { getSessionPayload } });
    }

    const rateLimiter = RateLimiterMap[type];
    const rateLimiterResult = await getResultAsync(() =>
      rateLimiter.consume(getSessionPayload ? getSessionPayload.user.id : `${path}${ID_SEPARATOR}${ipAddress}`),
    );
    const { msBeforeNext, remainingPoints } = rateLimiterResult.match(
      (result) => result,
      (error) => {
        if (error instanceof RateLimiterRes) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      },
    );
    if ("setHeader" in ctx.res) {
      ctx.res.setHeader("Retry-After", Math.ceil(dayjs.duration(msBeforeNext).asSeconds()));
      ctx.res.setHeader("X-RateLimit-Limit", rateLimiter.points);
      ctx.res.setHeader("X-RateLimit-Remaining", remainingPoints);
      ctx.res.setHeader("X-RateLimit-Reset", new Date(Date.now() + msBeforeNext).toISOString());
    }

    return next({ ctx: { getSessionPayload } });
  });
