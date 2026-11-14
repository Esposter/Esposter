import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { RoomInMessage } from "@esposter/db-schema";

import { getBucket } from "#src/services/storage/getBucket";
import { writeBlobEntry } from "#src/services/user/writeBlobEntry";
import { listBlobNames } from "@esposter/db";
import { StorageBucket } from "@esposter/db-schema";

// The images a room holds, which the room's own teardown sweeps under its prefix.
// Each is written under the room's images directory, keeping the name the room gave it
export const writeRoomImageEntries = async (archive: UserDataArchive, roomId: RoomInMessage["id"]): Promise<void> => {
  const bucket = getBucket(StorageBucket.PublicUserAssets);
  const roomPrefix = `rooms/${roomId}/`;
  const blobNames = await listBlobNames(bucket, roomPrefix);
  for (const blobName of blobNames)
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one image at a time, streamed as it is read
    await writeBlobEntry(archive, `rooms/${roomId}/images/${blobName.slice(roomPrefix.length)}`, bucket, blobName);
};
