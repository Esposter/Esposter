import type { Clause, StandardMessageEntity } from "@esposter/db-schema";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { messageEventEmitter } from "@@/server/services/message/events/messageEventEmitter";
import { getTableNullClause, serializeClauses, serializeEntity, submitTransactionBatches } from "@esposter/db";
import {
  AZURE_MAX_PAGE_SIZE,
  AzureTable,
  BinaryOperator,
  CompositeKeyPropertyNames,
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
      page,
      ({ partitionKey, rowKey }) => [
        "update",
        serializeEntity({ deletedAt: now, partitionKey, rowKey, updatedAt: now }),
      ],
      (batch) => {
        for (const { partitionKey, rowKey } of batch)
          messageEventEmitter.emit("deleteMessage", { partitionKey, rowKey });
      },
    );
};
