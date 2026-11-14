import type { StreamTable, StreamTableEntityMap, Clause } from "@esposter/db-schema";
import type { StreamTableAction } from "#src/models/streams/StreamTableAction";
import type { StreamTableClient } from "#src/models/streams/StreamTableClient";
import type { UpdateMode } from "#src/models/streams/UpdateMode";
import type { Promisable } from "type-fest";

import { deserializeEntity } from "#src/services/streams/deserializeEntity";
import { serializeEntity } from "#src/services/streams/serializeEntity";
import { AZURE_MAX_BATCH_SIZE } from "@esposter/azure";
import { StandardMessageEntity } from "@esposter/db-schema";
import { chunk } from "@esposter/shared";

// Writes to every message the clauses select, one batch of rows at a time. A Merge writes only the delta `getUpdate`
// Returns and stays unconditional. A Replace writes the whole listed message with that delta applied, conditional on
// The etag it was listed with, so a message another write changed after the listing is refused rather than overwritten
// With this run's copy of it. `onBatchUpdated` runs as soon as each batch commits, so a run that stops partway still
// Hands the caller everything it managed to write. Every write stamps `updatedAt` with the same time, taken once for
// The run
export const updateRoomMessagesByUser = async (
  messageClient: StreamTableClient<StreamTableEntityMap[StreamTable.Messages]>,
  clauses: Clause<StandardMessageEntity>[],
  mode: UpdateMode,
  getUpdate: (message: StandardMessageEntity, now: Date) => Partial<StandardMessageEntity>,
  onBatchUpdated: (batch: StandardMessageEntity[]) => Promisable<void>,
): Promise<void> => {
  const now = new Date();
  const rows = await messageClient.list(clauses);
  for (const batch of chunk(rows, AZURE_MAX_BATCH_SIZE)) {
    // Listed entities carry their properties in stored form, so `files` is only an array once deserialized. A Replace
    // writes the row as it is stored, so its update applies to the listed row rather than the deserialized one
    const listed = batch.map(({ etag, ...entity }) => ({
      entity,
      etag,
      message: deserializeEntity(entity, StandardMessageEntity),
    }));
    await messageClient.submitTransaction(
      listed.map(({ entity, etag, message }): StreamTableAction => {
        const update = { ...getUpdate(message, now), updatedAt: now };
        return mode === "Replace"
          ? ["update", serializeEntity({ ...entity, ...update }), mode, { etag }]
          : [
              "update",
              serializeEntity({ ...update, partitionKey: message.partitionKey, rowKey: message.rowKey }),
              mode,
            ];
      }),
    );
    await onBatchUpdated(listed.map(({ message }) => message));
  }
};
