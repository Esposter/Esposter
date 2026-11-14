import type { RoomMessage } from "@esposter/db-schema";

import { publishBlobDeletion } from "#server/services/queue/publishBlobDeletion";
import { getFilesBlobNames } from "@esposter/db";
import { StorageBucket } from "@esposter/db-schema";
import { noop } from "@esposter/shared";

// Queues the attachments of messages a delete has just committed. Hiding the messages leaves their attachments reachable
// to anyone still holding a read SAS minted before the delete, and no other delete path reclaims them afterwards, so the
// blobs are queued for deletion behind the write (openspec/specs/architecture/persist-then-notify/design.md)
export const publishDeletedMessageFiles = async (roomId: string, messages: RoomMessage[]): Promise<void> => {
  await publishBlobDeletion(
    StorageBucket.MessageAssets,
    messages.flatMap(({ files }) => getFilesBlobNames(roomId, files)),
  ).match(noop, console.error);
};
