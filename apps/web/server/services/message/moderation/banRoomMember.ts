import type { Context } from "#server/trpc/context";

import { getRoomMembershipWhere } from "#server/services/room/getRoomMembershipWhere";
import { bansInMessage, usersToRoomsInMessage } from "@esposter/db-schema";

// A ban revokes membership and records the ban in one batch — both the ban and the soft ban start here.
// The membership row comes back so the caller can announce the removal, which is not part of the batch
export const banRoomMember = async (db: Context["db"], actorUserId: string, roomId: string, targetUserId: string) => {
  const [deletedMembers] = await db.batch([
    db.delete(usersToRoomsInMessage).where(getRoomMembershipWhere(roomId, targetUserId)).returning(),
    db
      .insert(bansInMessage)
      .values({ bannedByUserId: actorUserId, roomId, userId: targetUserId })
      .onConflictDoNothing(),
  ]);
  return deletedMembers[0];
};
