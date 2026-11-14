import { RateLimiterType } from "#server/models/rateLimiter/RateLimiterType";
import { publicProcedure } from "#server/trpc";
import { getRateLimitedMiddleware } from "#server/trpc/middleware/getRateLimitedMiddleware";
import { publishTopicsMiddleware } from "#server/trpc/middleware/publishTopicsMiddleware";

export const standardRateLimitedProcedure = publicProcedure
  .use(publishTopicsMiddleware)
  .use(getRateLimitedMiddleware(RateLimiterType.Standard));
