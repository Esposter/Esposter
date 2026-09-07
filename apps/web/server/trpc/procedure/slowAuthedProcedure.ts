import { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";
import { publicProcedure } from "@@/server/trpc";
import { getAuthedMiddleware } from "@@/server/trpc/middleware/getAuthedMiddleware";
import { achievementPlugin } from "@@/server/trpc/plugins/achievementPlugin";
// oxlint-disable-next-line prefer-spread
export const slowAuthedProcedure = publicProcedure
  .use(getAuthedMiddleware(RateLimiterType.Slow))
  .concat(achievementPlugin);
