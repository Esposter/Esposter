import { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";
import { publicProcedure } from "@@/server/trpc";
import { getIsAuthed } from "@@/server/trpc/middleware/getIsAuthed";

export const slowAuthedProcedure = publicProcedure.use(getIsAuthed(RateLimiterType.Slow));
