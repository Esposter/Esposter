import type { StandardMessageEntity } from "@esposter/db-schema";

import { publishBlobDeletion } from "#server/services/azure/eventGrid/publishBlobDeletion";
import { messageEventEmitter } from "#server/services/message/events/messageEventEmitter";
import { getFilesBlobNames } from "@esposter/db";
import { AzureContainer } from "@esposter/db-schema";
import { noop } from "@esposter/shared";

// Announces one batch the soft delete has just committed: each message leaves the room's live views, and its
// Attachments are queued for deletion. Hiding the messages leaves their attachments reachable to anyone still holding
// A read SAS minted before the ban, and no other delete path can reclaim them afterwards — `deleteMessage` rejects an
// Entity that already carries `deletedAt`, and `deleteFile` needs a live message — so the blobs would be billed until
// The room itself is deleted. Published per batch, behind the write, like every other delete
// (openspec/specs/architecture/persist-then-notify/design.md)
export const publishSoftDeletedMessages = async (roomId: string, batch: StandardMessageEntity[]): Promise<void> => {
  for (const { partitionKey, rowKey } of batch) messageEventEmitter.emit("deleteMessage", [{ partitionKey, rowKey }]);
  await publishBlobDeletion(
    roomId,
    AzureContainer.MessageAssets,
    batch.flatMap(({ files }) => getFilesBlobNames(roomId, files)),
  ).match(noop, console.error);
};
