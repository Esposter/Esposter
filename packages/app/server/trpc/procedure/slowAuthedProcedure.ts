import { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";
import { publicProcedure } from "@@/server/trpc";
import { achievementMiddleware } from "@@/server/trpc/middleware/achievementMiddleware";
import { getIsAuthed } from "@@/server/trpc/middleware/getIsAuthed";

export const slowAuthedProcedure = publicProcedure.use(getIsAuthed(RateLimiterType.Slow)).use(achievementMiddleware);
