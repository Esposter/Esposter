import { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";
import { publicProcedure } from "@@/server/trpc";
import { getIsRateLimited } from "@@/server/trpc/middleware/getIsRateLimited";

export const standardRateLimitedProcedure = publicProcedure.use(getIsRateLimited(RateLimiterType.Standard));
