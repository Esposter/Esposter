import type { AzureContainer, BlobDeletionEventGridData } from "@esposter/db-schema";

import { useEventGridPublisherClient } from "@@/server/composables/azure/eventGrid/useEventGridPublisherClient";
import { AzureFunction, createEventGridEvent } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// The unbounded counterpart to `publishBlobDeletion`: publishes the prefix itself so the handler enumerates
// It. A caller whose blob set has no ceiling — a room's entire attachment directory — must never walk it
// Inline, because the listing and every event it chunks into land on the request path with the caller's
// Response waiting on them. Same best-effort, post-persist contract
// (/docs/architecture/persist-then-notify): a dropped publish orphans blobs, never the mutation that landed.
// `createdBefore` is stated by every caller rather than defaulted, because both answers are load-bearing and
// Neither is safe to inherit: a bound the caller wanted and did not get lets a replay delete what was written
// After the decision, and a bound on a prefix nothing will ever own again permanently strands every blob that
// Landed after it (an upload holding a still-valid write SAS when its room was deleted has no later sweep).
export const publishBlobPrefixDeletion = async (
  subject: string,
  containerName: AzureContainer,
  prefix: string,
  createdBefore: Date | undefined,
): Promise<void> => {
  await getResultAsync(async () => {
    // Stamped at publish time, not at delivery: the handler must only ever delete what the caller was looking at.
    // Spread rather than assigned, so an unbounded sweep publishes no key at all instead of an undefined one
    const data: BlobDeletionEventGridData = { containerName, prefix, ...(createdBefore && { createdBefore }) };
    await useEventGridPublisherClient().send([createEventGridEvent(AzureFunction.ProcessBlobDeletion, subject, data)]);
  }).match(noop, console.error);
};
