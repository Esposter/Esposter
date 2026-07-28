import type { AzureContainer, BlobDeletionEventGridData } from "@esposter/db-schema";

import { useEventGridPublisherClient } from "@@/server/composables/azure/eventGrid/useEventGridPublisherClient";
import { chunkBlobNamesByEventSize } from "@@/server/services/azure/eventGrid/chunkBlobNamesByEventSize";
import { AzureFunction, createEventGridEvent } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
// The one durable blob-cleanup publish every delete funnels through — best-effort and post-persist
// (/docs/architecture/persist-then-notify): a failed listing or publish only orphans blobs, never the mutation
// That already landed, while a publish that lands is retried to completion by the idempotent handler. Accepts a
// Thunk so a fallible listing runs inside the same best-effort unit, and chunks because a listing can hold more
// Names than one event may carry — a publish that fails midway still made every chunk before it durable.
export const publishBlobDeletion = async (
  subject: string,
  containerName: AzureContainer,
  blobNames: (() => Promise<string[]>) | string[],
): Promise<void> => {
  await getResultAsync(async () => {
    const blobNamesValue = typeof blobNames === "function" ? await blobNames() : blobNames;
    if (blobNamesValue.length === 0) return;

    const eventGridPublisherClient = useEventGridPublisherClient();
    // Deduplicated here rather than at each caller, because the handler's schema requires unique names and a
    // Publisher that concatenates two listings has no way to know they are disjoint. A repeated name would only
    // Ever have cost one no-op `deleteIfExists`, but it fails the parse before any delete runs — turning a
    // Harmless duplicate into a chunk of blobs that no delivery, retry or replay can ever reclaim.
    for (const blobNamesChunk of chunkBlobNamesByEventSize([...new Set(blobNamesValue)])) {
      const data: BlobDeletionEventGridData = { blobNames: blobNamesChunk, containerName };
      await eventGridPublisherClient.send([createEventGridEvent(AzureFunction.ProcessBlobDeletion, subject, data)]);
    }
  }).match(noop, console.error);
};
