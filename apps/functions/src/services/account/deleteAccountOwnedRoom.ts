import type { RoomInMessage } from "@esposter/db-schema";

import { getRoomObject } from "#src/services/room/getRoomObject";
import { db } from "#src/services/shared/db";
import { deleteStoragePrefix } from "#src/services/storage/deleteStoragePrefix";
import { StorageBucket, roomsInMessage } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// An owner's departure deletes the room for everyone, and account deletion does the same to each room its account owns.
// The attachments and the profile images go first, then the room's object, which holds its messages, reactions, search
// index and scheduled messages, and the room row last: the row is what a replay finds the room by, so a room whose sweep
// fails keeps its row and is swept again. The room's moderation log and notes are rows that cascade with the room row, so
// they need no sweep of their own
export const deleteAccountOwnedRoom = async (roomId: RoomInMessage["id"]): Promise<void> => {
  await deleteStoragePrefix(StorageBucket.MessageAssets, `${roomId}/`);
  await deleteStoragePrefix(StorageBucket.PublicUserAssets, `rooms/${roomId}/`);
  await getRoomObject(roomId).deleteAll();
  await db.delete(roomsInMessage).where(eq(roomsInMessage.id, roomId));
};
