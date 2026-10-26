import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { RoomInMessage } from "@esposter/db-schema";

import { getContainerClient } from "#src/services/azure/getContainerClient";
import { writeBlobEntry } from "#src/services/user/writeBlobEntry";
import { AzureContainer, getRoomEmojiBlobName } from "@esposter/db-schema";

// The emoji blobs of a room, one at a time, each under the room's emoji directory
export const writeRoomEmojiEntries = async (
  archive: UserDataArchive,
  roomId: RoomInMessage["id"],
  emoji: { id: string }[],
): Promise<void> => {
  const containerClient = await getContainerClient(AzureContainer.MessageAssets);
  for (const { id } of emoji)
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one emoji at a time, streamed as it is read
    await writeBlobEntry(archive, `rooms/${roomId}/emoji/${id}`, containerClient, getRoomEmojiBlobName(roomId, id));
};
