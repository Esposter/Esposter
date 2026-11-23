import type { Context } from "#server/trpc/context";

import { getRoomMembershipRemoval } from "#server/services/room/getRoomMembershipRemoval";
import { bansInMessage } from "@esposter/db-schema";
import { isNotNull } from "drizzle-orm";

// A ban revokes membership and records the ban in one batch — both the ban and the soft ban start here.
// The membership row comes back so the caller can announce the removal, which is not part of the batch
export const banRoomMember = async (db: Context["db"], actorUserId: string, roomId: string, targetUserId: string) => {
  const [[deletedMember]] = await db.batch([
    ...getRoomMembershipRemoval(db, roomId, targetUserId),
    db
      .insert(bansInMessage)
      .values({ bannedByUserId: actorUserId, roomId, userId: targetUserId })
      // A ban made again revives the tombstone an unban left, taking the new moderator and time. A live ban is left as
      // It is
      .onConflictDoUpdate({
        set: { bannedByUserId: actorUserId, createdAt: new Date(), deletedAt: null },
        setWhere: isNotNull(bansInMessage.deletedAt),
        target: [bansInMessage.roomId, bansInMessage.userId],
      }),
  ]);
  return deletedMember;
};
