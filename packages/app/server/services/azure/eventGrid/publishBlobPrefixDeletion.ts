import type { AzureContainer, BlobDeletionEventGridData } from "@esposter/db-schema";

import { useEventGridPublisherClient } from "@@/server/composables/azure/eventGrid/useEventGridPublisherClient";
import { AzureFunction, createEventGridEvent } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// The unbounded counterpart to `publishBlobDeletion`: publishes the prefix itself so the handler enumerates
// It. A caller whose blob set has no ceiling — a room's entire attachment directory — must never walk it
// Inline, because the listing and every event it chunks into land on the request path with the caller's
// Response waiting on them. Same best-effort, post-persist contract
// (/docs/architecture/persist-then-notify): a dropped publish orphans blobs, never the mutation that landed.
export const publishBlobPrefixDeletion = async (
  subject: string,
  containerName: AzureContainer,
  prefix: string,
): Promise<void> => {
  await getResultAsync(async () => {
    // Stamped at publish time, not at delivery: the handler must only ever delete what the caller was looking at
    const data: BlobDeletionEventGridData = { containerName, createdBefore: new Date(), prefix };
    await useEventGridPublisherClient().send([createEventGridEvent(AzureFunction.ProcessBlobDeletion, subject, data)]);
  }).match(noop, console.error);
};
