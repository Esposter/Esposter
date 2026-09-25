import type { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";

import { publicProcedure } from "@@/server/trpc";
import { getAuthedMiddleware } from "@@/server/trpc/middleware/getAuthedMiddleware";
import { achievementPlugin } from "@@/server/trpc/plugins/achievementPlugin";

export const getAuthedProcedure = (rateLimiterType: RateLimiterType) =>
  // oxlint-disable-next-line prefer-spread -- `concat` is tRPC's procedure-builder merge, not an array's
  publicProcedure.use(getAuthedMiddleware(rateLimiterType)).concat(achievementPlugin);
