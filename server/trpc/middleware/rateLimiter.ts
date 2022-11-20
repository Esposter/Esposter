import { middleware } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { RateLimiterMemory } from "rate-limiter-flexible";

const rateLimiter = new RateLimiterMemory({ points: 5, duration: 1, blockDuration: 5 });

export const isRateLimited = middleware(async ({ ctx, next, path }) => {
  const ip =
    ((ctx.req.headers["x-forwarded-for"] as string | undefined) || "").split(",").pop()?.trim() ||
    ctx.req.socket.remoteAddress;
  if (!ip) throw new TRPCError({ code: "BAD_REQUEST" });

  try {
    const response = await rateLimiter.consume(`${path}|${ip}`);
    ctx.res.setHeader("Retry-After", response.msBeforeNext / 1000);
    ctx.res.setHeader("X-RateLimit-Limit", rateLimiter.points);
    ctx.res.setHeader("X-RateLimit-Remaining", response.remainingPoints);
    ctx.res.setHeader("X-RateLimit-Reset", new Date(Date.now() + response.msBeforeNext).toISOString());
  } catch {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
  }
  return next({ ctx });
});
