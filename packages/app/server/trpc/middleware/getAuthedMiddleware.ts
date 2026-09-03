import type { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";

import { getRateLimitedMiddleware } from "@@/server/trpc/middleware/getRateLimitedMiddleware";
import { TRPCError } from "@trpc/server";

export const getAuthedMiddleware = (rateLimiterType: RateLimiterType) =>
  getRateLimitedMiddleware(rateLimiterType).unstable_pipe(({ ctx: { getSessionPayload }, next }) => {
    if (!getSessionPayload) throw new TRPCError({ code: "UNAUTHORIZED" });
    return next({ ctx: { getSessionPayload } });
  });
