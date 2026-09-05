import type { InvocationContext } from "@azure/functions";
import type { BlockBlobClient } from "@azure/storage-blob";

import { AzureFunction } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// Best-effort, like every step after the quarantine copy is written: the record of what arrived already survives, so a
// Transient delete failure must not rethrow and have Event Grid redeliver the blob — each redelivery would re-emit the
// Quarantine error and duplicate the quarantine record for one throttled DELETE. Nothing external watches that
// Error (/docs/infra/eventgrid-dead-letter), so a quarantined event is found by inspecting the container. An undeleted original merely lingers until the container's lifecycle rule
// Sweeps it; only a BlobCreated event can retrigger a replay.
export const deleteReplayedBlob = async (
  context: InvocationContext,
  blockBlobClient: BlockBlobClient,
  blobName: string,
): Promise<void> => {
  await getResultAsync(() => blockBlobClient.delete()).match(noop, (error) => {
    context.error(`${AzureFunction.ReplayDeadLetterEvent} left ${blobName} undeleted: `, error);
  });
};
