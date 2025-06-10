import { middleware } from "@@/server/trpc";
import { ID_SEPARATOR } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { RateLimiterMemory } from "rate-limiter-flexible";

const rateLimiter = new RateLimiterMemory({ blockDuration: 5, duration: 1, points: 5 });

export const isRateLimited = middleware(async ({ ctx, next, path }) => {
  const ip =
    ((ctx.req.headers["x-forwarded-for"] as string | undefined) ?? "").split(",").pop()?.trim() ??
    ctx.req.socket.remoteAddress;
  if (!ip) throw new TRPCError({ code: "BAD_REQUEST" });
  else if (ip === "::1") return next();

  try {
    const { msBeforeNext, remainingPoints } = await rateLimiter.consume(`${path}${ID_SEPARATOR}${ip}`);
    if ("setHeader" in ctx.res) {
      ctx.res.setHeader("Retry-After", msBeforeNext / 1000);
      ctx.res.setHeader("X-RateLimit-Limit", rateLimiter.points);
      ctx.res.setHeader("X-RateLimit-Remaining", remainingPoints);
      ctx.res.setHeader("X-RateLimit-Reset", new Date(Date.now() + msBeforeNext).toISOString());
    }
  } catch {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
  }

  return next();
});
