import type { Context } from "@@/server/trpc/context";

import { hasPermission } from "@@/server/services/room/rbac/hasPermission";
import { RoomPermission } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";

export const assertNotInSlowmode = async (db: Context["db"], userId: string, roomId: string) => {
  const room = await db.query.roomsInMessage.findFirst({
    columns: { slowmodeMs: true },
    where: { id: { eq: roomId } },
  });
  if (!room?.slowmodeMs) return;
  const canBypass = await hasPermission(db, userId, roomId, RoomPermission.ManageMessages);
  if (canBypass) return;
  const member = await db.query.usersToRoomsInMessage.findFirst({
    columns: { lastMessageAt: true },
    where: { roomId: { eq: roomId }, userId: { eq: userId } },
  });
  if (member?.lastMessageAt) {
    const elapsedMs = Date.now() - member.lastMessageAt.getTime();
    if (elapsedMs < room.slowmodeMs) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
  }
};
