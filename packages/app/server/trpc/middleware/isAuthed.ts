import { isRateLimited } from "@@/server/trpc/middleware/isRateLimited";
import { TRPCError } from "@trpc/server";

export const isAuthed = isRateLimited.unstable_pipe(({ ctx: { session }, next }) => {
  if (!session) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { session } });
});
