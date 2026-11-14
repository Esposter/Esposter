import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { RoomInMessage, RoomMessage } from "@esposter/db-schema";

import { getBucket } from "#src/services/storage/getBucket";
import { writeBlobEntry } from "#src/services/user/writeBlobEntry";
import { getFileBlobNames } from "@esposter/db";
import { StorageBucket } from "@esposter/db-schema";

// The files the given messages attach, one at a time.
// Each file is named by its message room and its own id, so two files sharing a filename never share an entry
export const writeRoomFileEntries = async (
  archive: UserDataArchive,
  roomId: RoomInMessage["id"],
  messages: RoomMessage[],
): Promise<void> => {
  const bucket = getBucket(StorageBucket.MessageAssets);
  const attachments = messages.flatMap(({ files }) => files);
  for (const { filename, id } of attachments)
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one attachment at a time, streamed as it is read
    await writeBlobEntry(
      archive,
      `rooms/${roomId}/files/${id}/${filename}`,
      bucket,
      getFileBlobNames(roomId, id, filename).blobName,
    );
};
