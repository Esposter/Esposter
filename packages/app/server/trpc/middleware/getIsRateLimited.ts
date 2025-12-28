import { auth } from "@@/server/auth";
import { useIsProduction } from "@@/server/composables/useIsProduction";
import { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";
import { RateLimiterMap } from "@@/server/services/rateLimiter/RateLimiterMap";
import { middleware } from "@@/server/trpc";
import { ID_SEPARATOR } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const getIsRateLimited = (type: RateLimiterType) =>
  middleware(async ({ ctx, next, path }) => {
    const session = await auth.api.getSession({ headers: ctx.headers });
    const isProduction = useIsProduction();
    if (!isProduction) return next({ ctx: { session } });

    const forwardedFor = ctx.req.headers["x-forwarded-for"] as string | undefined;
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : ctx.req.socket.remoteAddress;
    if (!ipAddress) {
      console.warn(
        "Rate Limiter: Could not determine IP address. Bypassing middleware... This is expected for local production builds.",
      );
      return next({ ctx: { session } });
    }

    const rateLimiter = RateLimiterMap[type];
    try {
      const { msBeforeNext, remainingPoints } = await rateLimiter.consume(
        session ? session.user.id : `${path}${ID_SEPARATOR}${ipAddress}`,
      );
      if ("setHeader" in ctx.res) {
        ctx.res.setHeader("Retry-After", msBeforeNext / 1000);
        ctx.res.setHeader("X-RateLimit-Limit", rateLimiter.points);
        ctx.res.setHeader("X-RateLimit-Remaining", remainingPoints);
        ctx.res.setHeader("X-RateLimit-Reset", new Date(Date.now() + msBeforeNext).toISOString());
      }
    } catch {
      throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
    }

    return next({ ctx: { session } });
  });
