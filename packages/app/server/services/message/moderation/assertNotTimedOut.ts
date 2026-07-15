import type { UserToRoomInMessage } from "@esposter/db-schema";

import { TRPCError } from "@trpc/server";
// A timeout outranks every permission — a moderator who times themselves out stays timed out
export const assertNotTimedOut = (member: Pick<UserToRoomInMessage, "timeoutUntil"> | undefined): void => {
  if (member?.timeoutUntil && member.timeoutUntil > new Date()) throw new TRPCError({ code: "FORBIDDEN" });
};
