import type { RoomInMessage } from "@esposter/db-schema";

import { getRoomObject } from "#src/services/room/getRoomObject";
import { getDb } from "#src/services/shared/getDb";
import { deleteStoragePrefix } from "#src/services/storage/deleteStoragePrefix";
import { getRoomMemberIds } from "@esposter/db";
import { roomsInMessage, StorageBucket } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// An owner's departure deletes the room for everyone, and account deletion does the same to each room its account owns.
// The attachments and the profile images go next.
// Then the room's object, which holds its messages, reactions, search index and scheduled messages, goes. It sends no notice
// Of its own: the members learn of the removal from the membership rows that go with the room.
// The scheduled messages of other people go with it, and each sender's index publishes its own removal as the object makes it
// The room row goes last: the row is what a replay finds the room by.
// So a room whose sweep fails keeps its row and is swept again.
// The room's moderation log and notes are rows that cascade with the room row. So they need no sweep of their own
export const deleteAccountOwnedRoom = async (roomId: RoomInMessage["id"]): Promise<void> => {
  await deleteStoragePrefix(StorageBucket.MessageAssets, `${roomId}/`);
  await deleteStoragePrefix(StorageBucket.PublicUserAssets, `rooms/${roomId}/`);
  await getRoomObject(roomId).deleteAll(await getRoomMemberIds(getDb(), roomId));
  await getDb().delete(roomsInMessage).where(eq(roomsInMessage.id, roomId));
};
