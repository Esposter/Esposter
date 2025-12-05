import { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";
import { publicProcedure } from "@@/server/trpc";
import { getIsAuthed } from "@@/server/trpc/middleware/getIsAuthed";
import { achievementPlugin } from "@@/server/trpc/plugins/achievementPlugin";
import { userActivityPlugin } from "@@/server/trpc/plugins/userActivityPlugin";
// oxlint-disable-next-line prefer-spread
export const standardAuthedProcedure = publicProcedure
  .use(getIsAuthed(RateLimiterType.Standard))
  .concat(achievementPlugin)
  .concat(userActivityPlugin);
