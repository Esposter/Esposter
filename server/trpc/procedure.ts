import { publicProcedure } from "@/server/trpc";
import { isRateLimited } from "@/server/trpc/middleware/rateLimiter";

export const rateLimitedProcedure = publicProcedure.use(isRateLimited);
