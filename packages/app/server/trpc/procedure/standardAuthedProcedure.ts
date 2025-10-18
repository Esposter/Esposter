import { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";
import { publicProcedure } from "@@/server/trpc";
import { getIsAuthed } from "@@/server/trpc/middleware/getIsAuthed";

export const standardAuthedProcedure = publicProcedure.use(getIsAuthed(RateLimiterType.Standard));
