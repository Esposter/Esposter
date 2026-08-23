import type { Clause } from "@esposter/azure";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { publishBlobDeletion } from "@@/server/services/azure/eventGrid/publishBlobDeletion";
import { messageEventEmitter } from "@@/server/services/message/events/messageEventEmitter";
import {
  AZURE_MAX_PAGE_SIZE,
  BinaryOperator,
  CompositeKeyPropertyNames,
  getTableNullClause,
  serializeClauses,
} from "@esposter/azure";
import { deserializeEntity, getFilesBlobNames, serializeEntity, submitTransactionBatches } from "@esposter/db";
import {
  AzureContainer,
  AzureTable,
  StandardMessageEntity,
  StandardMessageEntityPropertyNames,
} from "@esposter/db-schema";
import { ItemMetadataPropertyNames } from "@esposter/shared";

// Soft-deletes every message a user still has visible in a room, one Table batch at a time. Each batch notifies
// As soon as it commits, so a purge that stops partway still hides everything it managed to write.
export const softDeleteRoomMessagesByUser = async (roomId: string, targetUserId: string): Promise<void> => {
  const messageClient = await useTableClient(AzureTable.Messages);
  const filter = serializeClauses([
    { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: roomId },
    { key: StandardMessageEntityPropertyNames.userId, operator: BinaryOperator.eq, value: targetUserId },
    getTableNullClause(ItemMetadataPropertyNames.deletedAt),
  ] as Clause<StandardMessageEntity>[]);
  const now = new Date();
  for await (const page of messageClient
    .listEntities<StandardMessageEntity>({ queryOptions: { filter } })
    .byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE }))
    await submitTransactionBatches(
      messageClient,
      // Listed entities carry their properties in serialized form, so `files` is only an array once deserialized
      page.map(({ etag: _etag, ...entity }) => deserializeEntity(entity, StandardMessageEntity)),
      ({ partitionKey, rowKey }) => [
        "update",
        serializeEntity({ deletedAt: now, partitionKey, rowKey, updatedAt: now }),
      ],
      async (batch) => {
        for (const { partitionKey, rowKey } of batch)
          messageEventEmitter.emit("deleteMessage", [{ partitionKey, rowKey }]);
        // Hiding the messages leaves their attachments reachable to anyone still holding a read SAS minted before
        // The ban, and no other delete path can reclaim them afterwards — `deleteMessage` rejects an entity that
        // Already carries `deletedAt`, and `deleteFile` needs a live message — so the blobs would be billed until
        // The room itself is deleted. Published per batch, behind the write, like every other delete
        // (/docs/architecture/persist-then-notify)
        await publishBlobDeletion(
          roomId,
          AzureContainer.MessageAssets,
          batch.flatMap(({ files }) => getFilesBlobNames(roomId, files)),
        );
      },
    );
};
