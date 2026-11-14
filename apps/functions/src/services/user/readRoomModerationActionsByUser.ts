import type { Database, UserInAuth } from "@esposter/db-schema";

import { moderationLogsInMessage, roomsInMessage } from "@esposter/db-schema";
import { and, eq, inArray } from "drizzle-orm";

// The moderation actions one person took as moderator or admin in the rooms they own, each with its action type, its time
// and the id of the person it was taken against. The owned rooms are a subquery, so one read covers every room.
// The row holds no content of the target's, so none is read
export const readRoomModerationActionsByUser = async (db: Database, userId: UserInAuth["id"]) => {
  const ownedRoomIds = db
    .select({ id: roomsInMessage.id })
    .from(roomsInMessage)
    .where(eq(roomsInMessage.userId, userId));
  const actions = await db
    .select({
      createdAt: moderationLogsInMessage.createdAt,
      roomId: moderationLogsInMessage.roomId,
      targetUserId: moderationLogsInMessage.targetUserId,
      type: moderationLogsInMessage.type,
    })
    .from(moderationLogsInMessage)
    .where(and(eq(moderationLogsInMessage.actorUserId, userId), inArray(moderationLogsInMessage.roomId, ownedRoomIds)));
  return actions.map(({ createdAt, roomId, targetUserId, type }) => ({ roomId, targetUserId, time: createdAt, type }));
};
