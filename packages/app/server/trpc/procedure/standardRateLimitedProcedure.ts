import { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";
import { publicProcedure } from "@@/server/trpc";
import { getRateLimitedMiddleware } from "@@/server/trpc/middleware/getRateLimitedMiddleware";

export const standardRateLimitedProcedure = publicProcedure.use(getRateLimitedMiddleware(RateLimiterType.Standard));
