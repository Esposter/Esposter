import { publicProcedure } from "@/server/trpc";
import { isAuthed } from "@/server/trpc/middleware/auth";
import { isRateLimited } from "@/server/trpc/middleware/rateLimiter";

export const rateLimitedProcedure = publicProcedure.use(isRateLimited);
export const authedProcedure = rateLimitedProcedure.use(isAuthed);
