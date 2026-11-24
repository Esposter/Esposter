import type { BlobDeletionQueueMessage, StorageBucket } from "@esposter/db-schema";

import { chunkBlobNamesByMessageSize } from "#server/services/queue/chunkBlobNamesByMessageSize";
import { getJobQueue } from "#server/services/queue/getJobQueue";
import { QueueJob } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

// The one durable blob-cleanup publish every delete funnels through.
// It is best-effort and post-persist (openspec/specs/architecture/persist-then-notify/design.md).
// A failed listing or send only orphans blobs, and never the mutation that already landed.
// A send that lands is retried to completion by the idempotent handler.
// It accepts a thunk so a fallible listing runs inside the same best-effort unit.
// It chunks because a listing can hold more names than one message may carry.
// A send that fails midway still made every chunk before it durable.
export const publishBlobDeletion = (
  storageBucket: StorageBucket,
  blobNames: (() => Promise<string[]>) | string[],
  // The instant the names were judged unreferenced, forwarded so the handler keeps any blob written after it
  decidedAt?: Date,
) =>
  getResultAsync(async () => {
    const blobNamesValue = typeof blobNames === "function" ? await blobNames() : blobNames;
    if (blobNamesValue.length === 0) return;

    // Deduplicated here rather than at each caller, because the handler's schema requires unique names.
    // A publisher that concatenates two listings has no way to know they are disjoint.
    // A repeated name would only ever have cost one no-op delete.
    // But it fails the parse before any delete runs.
    // That turns a harmless duplicate into a chunk of blobs that no delivery, retry or replay can ever reclaim.
    for (const blobNamesChunk of chunkBlobNamesByMessageSize([...new Set(blobNamesValue)])) {
      // Spread rather than assigned, so a deletion without a decision sends no key at all instead of an undefined one
      const blobDeletionQueueMessage: BlobDeletionQueueMessage = {
        blobNames: blobNamesChunk,
        storageBucket,
        ...(decidedAt && { decidedAt }),
      };
      /* oxlint-disable-next-line no-await-in-loop -- Committed prefix: a failed chunk stops the ones behind it, and
         every chunk before it stays durable for a redelivery */
      await getJobQueue(QueueJob.ProcessBlobDeletion).send(blobDeletionQueueMessage);
    }
  });
