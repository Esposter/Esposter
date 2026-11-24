import type { RoomInMessage } from "@esposter/db-schema";

import { getRoomObject } from "#src/services/room/getRoomObject";
import { getDb } from "#src/services/shared/getDb";
import { deleteStoragePrefix } from "#src/services/storage/deleteStoragePrefix";
import { getUserObject } from "#src/services/user/getUserObject";
import { getRoomMemberIds } from "@esposter/db";
import { getLiveRowWhere, roomsInMessage, StorageBucket, usersToRoomsInMessage } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { and, eq } from "drizzle-orm";

// An owner's departure deletes the room for everyone, and account deletion does the same to each room its account owns.
// The attachments and the profile images go next.
// Then the room's object, which holds its messages, reactions, search index and scheduled messages, goes. It sends
// Nothing of its own, and the members are read before it goes, so each member's reminders for the room go with it.
// The memberships are tombstoned after that, and each member's object is sent its tombstone, as deleteRoom sends them,
// So a member's room list drops the room at the version the removal left. A member whose object cannot be reached sees
// It on reload. the scheduled messages of other people go with it, and each sender's index publishes its own removal as
// The object makes it. the room row goes last: the row is what a replay finds the room by.
// So a room whose sweep fails keeps its row and is swept again.
// The room's moderation log and notes are rows that cascade with the room row. So they need no sweep of their own
export const deleteAccountOwnedRoom = async (roomId: RoomInMessage["id"]): Promise<void> => {
  const db = getDb();
  await deleteStoragePrefix(StorageBucket.MessageAssets, `${roomId}/`);
  await deleteStoragePrefix(StorageBucket.PublicUserAssets, `rooms/${roomId}/`);
  await getRoomObject(roomId).deleteAll(await getRoomMemberIds(db, roomId));
  const removedMemberships = await db
    .update(usersToRoomsInMessage)
    .set({ deletedAt: new Date() })
    .where(and(eq(usersToRoomsInMessage.roomId, roomId), getLiveRowWhere(usersToRoomsInMessage)))
    .returning();
  await Promise.all(
    removedMemberships.map((membership) =>
      getResultAsync(() => getUserObject(membership.userId).updateUserToRoom(membership)).match(noop, (error) => {
        console.error("A room's removal failed to reach a member's object", {
          error,
          roomId,
          userId: membership.userId,
        });
      }),
    ),
  );
  await db.delete(roomsInMessage).where(eq(roomsInMessage.id, roomId));
};
