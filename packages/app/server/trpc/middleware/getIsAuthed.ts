import { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";
import { getIsRateLimited } from "@@/server/trpc/middleware/getIsRateLimited";
import { TRPCError } from "@trpc/server";

export const getIsAuthed = (rateLimiterType: RateLimiterType) =>
  getIsRateLimited(rateLimiterType).unstable_pipe(({ ctx: { getSessionPayload }, next }) => {
    if (!getSessionPayload) throw new TRPCError({ code: "UNAUTHORIZED" });
    return next({ ctx: { getSessionPayload } });
  });
