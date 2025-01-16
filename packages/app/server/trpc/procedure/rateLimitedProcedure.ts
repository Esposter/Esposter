import { publicProcedure } from "@@/server/trpc";
import { isRateLimited } from "@@/server/trpc/middleware/isRateLimited";

export const rateLimitedProcedure = publicProcedure.use(isRateLimited);
