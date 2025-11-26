import { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";
import { publicProcedure } from "@@/server/trpc";
import { achievementMiddleware } from "@@/server/trpc/middleware/achievementMiddleware";
import { getIsAuthed } from "@@/server/trpc/middleware/getIsAuthed";

export const standardAuthedProcedure = publicProcedure
  .use(getIsAuthed(RateLimiterType.Standard))
  .use(achievementMiddleware);
