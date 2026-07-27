import type { AzureContainer, BlobDeletionEventGridData } from "@esposter/db-schema";

import { useEventGridPublisherClient } from "@@/server/composables/azure/eventGrid/useEventGridPublisherClient";
import { AzureFunction, createEventGridEvent, MAX_BLOB_DELETION_EVENT_BLOB_NAMES } from "@esposter/db-schema";
import { chunk, getResultAsync, noop } from "@esposter/shared";
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
    for (const blobNamesChunk of chunk(blobNamesValue, MAX_BLOB_DELETION_EVENT_BLOB_NAMES)) {
      const data: BlobDeletionEventGridData = { blobNames: blobNamesChunk, containerName };
      await eventGridPublisherClient.send([createEventGridEvent(AzureFunction.ProcessBlobDeletion, subject, data)]);
    }
  }).match(noop, console.error);
};
