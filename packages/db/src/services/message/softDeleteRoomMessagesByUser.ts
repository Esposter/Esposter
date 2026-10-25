import type { AzureTable, AzureTableEntityMap, CustomTableClient } from "@esposter/db-schema";
import type { Clause } from "@esposter/azure";
import type { Promisable } from "type-fest";

import { getLivePartitionClauses } from "#src/services/azure/table/getLivePartitionClauses";
import { submitTransactionBatches } from "#src/services/azure/table/submitTransactionBatches";
import { deserializeEntity } from "#src/services/azure/transformer/deserializeEntity";
import { serializeEntity } from "#src/services/azure/transformer/serializeEntity";
import { AZURE_MAX_PAGE_SIZE, BinaryOperator, serializeClauses } from "@esposter/azure";
import { StandardMessageEntity, StandardMessageEntityPropertyNames } from "@esposter/db-schema";

// Soft-deletes every message a user still has visible in a room, one Table batch at a time. `onBatchSoftDeleted`
// Runs as soon as each batch commits, so a purge that stops partway still hides everything it managed to write, and
// Every batch it did hide is handed to the caller to announce
export const softDeleteRoomMessagesByUser = async (
  messageClient: CustomTableClient<AzureTableEntityMap[AzureTable.Messages]>,
  roomId: string,
  targetUserId: string,
  onBatchSoftDeleted: (batch: StandardMessageEntity[]) => Promisable<void>,
): Promise<void> => {
  const clauses: Clause<StandardMessageEntity>[] = [
    ...getLivePartitionClauses<StandardMessageEntity>(roomId),
    { key: StandardMessageEntityPropertyNames.userId, operator: BinaryOperator.Eq, value: targetUserId },
  ];
  const filter = serializeClauses(clauses);
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
      onBatchSoftDeleted,
    );
};
