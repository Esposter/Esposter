import { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";
import { publicProcedure } from "@@/server/trpc";
import { getIsAuthed } from "@@/server/trpc/middleware/getIsAuthed";
import { achievementPlugin } from "@@/server/trpc/plugins/achievementPlugin";
// oxlint-disable-next-line prefer-spread
export const slowAuthedProcedure = publicProcedure.use(getIsAuthed(RateLimiterType.Slow)).concat(achievementPlugin);
