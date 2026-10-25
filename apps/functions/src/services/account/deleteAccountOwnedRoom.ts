import type { InvocationContext } from "@azure/functions";
import type { RoomInMessage } from "@esposter/db-schema";

import { getTableClient } from "#src/services/azure/getTableClient";
import { db } from "#src/services/shared/db";
import { deleteStoragePrefix } from "#src/services/storage/deleteStoragePrefix";
import { deleteTablePartitionEntities } from "@esposter/db";
import { AzureContainer, AzureTable, roomsInMessage } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// An owner's departure deletes the room for everyone, and account deletion does the same to each room its account owns.
// The message partitions, the attachments and the profile images go first, and the room row last: the row is what a
// Replay finds the room by, so a room whose sweep fails keeps its row and is swept again
export const deleteAccountOwnedRoom = async (
  context: InvocationContext,
  roomId: RoomInMessage["id"],
): Promise<void> => {
  await Promise.all(
    [AzureTable.Messages, AzureTable.MessagesMetadata, AzureTable.ModerationLog, AzureTable.ModerationNotes].map(
      async (tableName) => deleteTablePartitionEntities(await getTableClient(tableName), roomId),
    ),
  );
  await deleteStoragePrefix(context, AzureContainer.MessageAssets, `${roomId}/`);
  await deleteStoragePrefix(context, AzureContainer.PublicUserAssets, `rooms/${roomId}/`);
  await db.delete(roomsInMessage).where(eq(roomsInMessage.id, roomId));
};
