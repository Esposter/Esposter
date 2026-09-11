import type { Context } from "@@/server/trpc/context";

import { getRoomMembershipWhere } from "@@/server/services/room/getRoomMembershipWhere";
import { bansInMessage, usersToRoomsInMessage } from "@esposter/db-schema";
// A ban revokes membership and records the ban in one commit — both the ban and the soft ban start here.
// The membership row comes back so the caller can announce the removal, which is not part of the commit
export const banRoomMember = (db: Context["db"], actorUserId: string, roomId: string, targetUserId: string) =>
  db.transaction(async (tx) => {
    const [deletedMember] = await tx
      .delete(usersToRoomsInMessage)
      .where(getRoomMembershipWhere(roomId, targetUserId))
      .returning();
    await tx
      .insert(bansInMessage)
      .values({ bannedByUserId: actorUserId, roomId, userId: targetUserId })
      .onConflictDoNothing();
    return deletedMember;
  });
