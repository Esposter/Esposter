import { auth } from "@@/server/auth";
import { useIsProduction } from "@@/server/composables/useIsProduction";
import { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";
import { RateLimiterMap } from "@@/server/services/rateLimiter/RateLimiterMap";
import { getIpAddress } from "@@/server/services/request/getIpAddress";
import { middleware } from "@@/server/trpc";
import { getResultAsync } from "@esposter/shared";
import { ID_SEPARATOR } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const getIsRateLimited = (type: RateLimiterType) =>
  middleware(async ({ ctx, next, path }) => {
    const getSessionPayload = await auth.api.getSession({ headers: ctx.headers });
    const isProduction = useIsProduction();
    if (!isProduction) return next({ ctx: { getSessionPayload } });

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
      () => {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
      },
    );
    if ("setHeader" in ctx.res) {
      ctx.res.setHeader("Retry-After", msBeforeNext / 1000);
      ctx.res.setHeader("X-RateLimit-Limit", rateLimiter.points);
      ctx.res.setHeader("X-RateLimit-Remaining", remainingPoints);
      ctx.res.setHeader("X-RateLimit-Reset", new Date(Date.now() + msBeforeNext).toISOString());
    }

    return next({ ctx: { getSessionPayload } });
  });
