import type { RoomInMessage, UserToRoomInMessage } from "@esposter/db-schema";

import { TRPCError } from "@trpc/server";

export const assertNotInSlowmode = async (
  room: Pick<RoomInMessage, "slowmodeMs"> | undefined,
  member: Pick<UserToRoomInMessage, "lastMessageAt"> | undefined,
  getCanManageMessages: () => Promise<boolean>,
): Promise<void> => {
  if (!room?.slowmodeMs || !member?.lastMessageAt) return;
  if (await getCanManageMessages()) return;

  const elapsedMs = Date.now() - member.lastMessageAt.getTime();
  if (elapsedMs < room.slowmodeMs) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
};
