import type { InvocationContext } from "@azure/functions";
import type { RoomInMessage } from "@esposter/db-schema";

import { getSearchClient } from "#src/services/azure/getSearchClient";
import { getStreamTableClient } from "#src/services/streams/getStreamTableClient";
import { db } from "#src/services/shared/db";
import { deleteStoragePrefix } from "#src/services/storage/deleteStoragePrefix";
import { getPartitionKeyFilter } from "@esposter/azure";
import { deleteSearchDocumentsByFilter, deleteTablePartitionEntities } from "@esposter/db";
import { StorageBucket, StreamTable, roomsInMessage, SearchIndex } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// An owner's departure deletes the room for everyone, and account deletion does the same to each room its account owns.
// The message partitions and the search documents that index them, the attachments and the profile images go first, and
// The room row last: the row is what a replay finds the room by, so a room whose sweep fails keeps its row and is swept again
export const deleteAccountOwnedRoom = async (
  context: InvocationContext,
  roomId: RoomInMessage["id"],
): Promise<void> => {
  await Promise.all(
    [
      StreamTable.Messages,
      StreamTable.MessagesMetadata,
      StreamTable.ModerationLog,
      StreamTable.ModerationNotes,
    ].map(async (tableName) => deleteTablePartitionEntities(getStreamTableClient(tableName), roomId)),
  );
  // The index is fed from the Messages partition just cleared, so the room's documents are removed once that partition is
  await deleteSearchDocumentsByFilter(getSearchClient(SearchIndex.Messages), getPartitionKeyFilter(roomId));
  await deleteStoragePrefix(context, StorageBucket.MessageAssets, `${roomId}/`);
  await deleteStoragePrefix(context, StorageBucket.PublicUserAssets, `rooms/${roomId}/`);
  await db.delete(roomsInMessage).where(eq(roomsInMessage.id, roomId));
};
