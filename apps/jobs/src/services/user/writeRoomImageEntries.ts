import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { RoomInMessage } from "@esposter/db-schema";

import { getBucket } from "#src/services/storage/getBucket";
import { writeBlobEntriesUnderPrefix } from "#src/services/user/writeBlobEntriesUnderPrefix";
import { StorageBucket } from "@esposter/db-schema";

// The images a room holds, which the room's own teardown sweeps under its prefix.
// Each is written under the room's images directory, keeping the name the room gave it
export const writeRoomImageEntries = async (archive: UserDataArchive, roomId: RoomInMessage["id"]): Promise<void> =>
  writeBlobEntriesUnderPrefix(
    archive,
    getBucket(StorageBucket.PublicUserAssets),
    `rooms/${roomId}/`,
    `rooms/${roomId}/images`,
  );
