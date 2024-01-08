import { middleware } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";
import { RateLimiterMemory } from "rate-limiter-flexible";

const rateLimiter = new RateLimiterMemory({ points: 5, duration: 1, blockDuration: 5 });

export const isRateLimited = middleware(async ({ ctx, next, path }) => {
  const ip =
    ((ctx.req.headers["x-forwarded-for"] as string | undefined) ?? "").split(",").pop()?.trim() ||
    ctx.req.socket.remoteAddress;
  if (!ip) throw new TRPCError({ code: "BAD_REQUEST" });

  try {
    const response = await rateLimiter.consume(`${path}|${ip}`);
    if ("setHeader" in ctx.res) {
      ctx.res.setHeader("Retry-After", response.msBeforeNext / dayjs.duration(1, "second").milliseconds());
      ctx.res.setHeader("X-RateLimit-Limit", rateLimiter.points);
      ctx.res.setHeader("X-RateLimit-Remaining", response.remainingPoints);
      ctx.res.setHeader("X-RateLimit-Reset", new Date(Date.now() + response.msBeforeNext).toISOString());
    }
  } catch {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
  }
  return next();
});
