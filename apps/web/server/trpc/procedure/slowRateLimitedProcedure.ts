import { RateLimiterType } from "#server/models/rateLimiter/RateLimiterType";
import { publicProcedure } from "#server/trpc";
import { getRateLimitedMiddleware } from "#server/trpc/middleware/getRateLimitedMiddleware";
import { publishTopicsMiddleware } from "#server/trpc/middleware/publishTopicsMiddleware";

// A public procedure on the tighter budget, for an anonymous write that adds rows rather than rewriting its own
export const slowRateLimitedProcedure = publicProcedure
  .use(publishTopicsMiddleware)
  .use(getRateLimitedMiddleware(RateLimiterType.Slow));
