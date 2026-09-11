import type { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";

import { publicProcedure } from "@@/server/trpc";
import { getAuthedMiddleware } from "@@/server/trpc/middleware/getAuthedMiddleware";
import { achievementPlugin } from "@@/server/trpc/plugins/achievementPlugin";

export const getAuthedProcedure = (rateLimiterType: RateLimiterType) =>
  // oxlint-disable-next-line prefer-spread
  publicProcedure.use(getAuthedMiddleware(rateLimiterType)).concat(achievementPlugin);
