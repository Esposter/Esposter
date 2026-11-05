import type { UpdateMode } from "@azure/data-tables";
import type { Clause } from "@esposter/azure";
import type { AzureTable, AzureTableEntityMap, CustomTableClient } from "@esposter/db-schema";
import type { Promisable } from "type-fest";

import { submitTransactionBatches } from "#src/services/azure/table/submitTransactionBatches";
import { deserializeEntity } from "#src/services/azure/transformer/deserializeEntity";
import { serializeEntity } from "#src/services/azure/transformer/serializeEntity";
import { AZURE_MAX_PAGE_SIZE, serializeClauses } from "@esposter/azure";
import { StandardMessageEntity } from "@esposter/db-schema";

// Writes to every message the clauses select, one Table batch at a time. A Merge writes only the delta `getUpdate`
// Returns and stays unconditional. A Replace writes the whole listed message with that delta applied, conditional on
// The etag it was listed with, so a message another write changed after the listing is refused rather than overwritten
// With this run's copy of it. `onBatchUpdated` runs as soon as each batch commits, so a run that stops partway still
// Hands the caller everything it managed to write. Every write stamps `updatedAt` with the same time, taken once for
// The run
export const updateRoomMessagesByUser = async (
  messageClient: CustomTableClient<AzureTableEntityMap[AzureTable.Messages]>,
  clauses: Clause<StandardMessageEntity>[],
  mode: UpdateMode,
  getUpdate: (message: StandardMessageEntity, now: Date) => Partial<StandardMessageEntity>,
  onBatchUpdated: (batch: StandardMessageEntity[]) => Promisable<void>,
): Promise<void> => {
  const filter = serializeClauses(clauses);
  const now = new Date();
  for await (const page of messageClient
    .listEntities<StandardMessageEntity>({ queryOptions: { filter } })
    .byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE }))
    await submitTransactionBatches(
      messageClient,
      // Listed entities carry their properties in serialized form, so `files` is only an array once deserialized. A
      // Replace writes the row as it is stored, so its update applies to the listed row rather than the deserialized one
      page.map(({ etag, ...entity }) => ({ entity, etag, message: deserializeEntity(entity, StandardMessageEntity) })),
      ({ entity, etag, message }) => {
        const update = { ...getUpdate(message, now), updatedAt: now };
        return mode === "Replace"
          ? ["update", serializeEntity({ ...entity, ...update }), mode, { etag }]
          : [
              "update",
              serializeEntity({ ...update, partitionKey: message.partitionKey, rowKey: message.rowKey }),
              mode,
            ];
      },
      (batch) => onBatchUpdated(batch.map(({ message }) => message)),
    );
};
