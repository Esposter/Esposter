import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { RoomInMessage } from "@esposter/db-schema";

import { getContainerClient } from "#src/services/azure/getContainerClient";
import { writeBlobEntry } from "#src/services/user/writeBlobEntry";
import { listBlobNames } from "@esposter/db";
import { AzureContainer } from "@esposter/db-schema";

// The images a room holds, which the room's own teardown sweeps under its prefix.
// Each is written under the room's images directory, keeping the name the room gave it
export const writeRoomImageEntries = async (archive: UserDataArchive, roomId: RoomInMessage["id"]): Promise<void> => {
  const containerClient = await getContainerClient(AzureContainer.PublicUserAssets);
  const roomPrefix = `rooms/${roomId}/`;
  const blobNames = await listBlobNames(containerClient, roomPrefix);
  for (const blobName of blobNames)
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one image at a time, streamed as it is read
    await writeBlobEntry(
      archive,
      `rooms/${roomId}/images/${blobName.slice(roomPrefix.length)}`,
      containerClient,
      blobName,
    );
};
