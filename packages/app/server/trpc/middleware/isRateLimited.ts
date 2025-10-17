import { auth } from "@@/server/auth";
import { useIsProduction } from "@@/server/composables/useIsProduction";
import { db } from "@@/server/db";
import { middleware } from "@@/server/trpc";
import { rateLimiterFlexible } from "@esposter/db-schema";
import { ID_SEPARATOR } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { RateLimiterDrizzleNonAtomic } from "rate-limiter-flexible";

const rateLimiter = new RateLimiterDrizzleNonAtomic({
  blockDuration: 60,
  duration: 10,
  points: 100,
  schema: rateLimiterFlexible,
  storeClient: db,
});

export const isRateLimited = middleware(async ({ ctx, next, path }) => {
  const session = await auth.api.getSession({ headers: ctx.headers });
  const isProduction = useIsProduction();
  if (!isProduction) return next({ ctx: { session } });

  const forwardedFor = ctx.req.headers["x-forwarded-for"] as string | undefined;
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : ctx.req.socket.remoteAddress;
  if (!ip) {
    console.warn(
      "Rate Limiter: Could not determine IP address. Bypassing middleware... This is expected for local production builds.",
    );
    return next({ ctx: { session } });
  }

  try {
    const { msBeforeNext, remainingPoints } = await rateLimiter.consume(
      session ? session.user.id : `${path}${ID_SEPARATOR}${ip}`,
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
