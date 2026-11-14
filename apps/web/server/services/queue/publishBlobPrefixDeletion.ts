import type { StorageBucket, BlobDeletionQueueMessage } from "@esposter/db-schema";

import { getJobQueue } from "#server/services/queue/getJobQueue";
import { QueueJob } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

// The unbounded counterpart to `publishBlobDeletion`: sends the prefix itself so the handler enumerates
// It. A caller whose blob set has no ceiling — a room's entire attachment directory — must never walk it
// Inline, because the listing and every message it chunks into land on the request path with the caller's
// Response waiting on them. Same best-effort, post-persist contract
// (openspec/specs/architecture/persist-then-notify/design.md): a dropped send orphans blobs, never
// The mutation that landed.
// `createdBefore` is stated by every caller rather than defaulted, because both answers are load-bearing and
// Neither is safe to inherit: a bound the caller wanted and did not get lets a replay delete what was written
// After the decision, and a bound on a prefix nothing will ever own again permanently strands every blob that
// Landed after it (an upload holding a still-valid write SAS when its room was deleted has no later sweep).
export const publishBlobPrefixDeletion = (
  containerName: StorageBucket,
  prefix: string,
  createdBefore: Date | undefined,
) =>
  getResultAsync(async () => {
    // Stamped at publish time, not at delivery: the handler must only ever delete what the caller was looking at.
    // Spread rather than assigned, so an unbounded sweep sends no key at all instead of an undefined one
    const data: BlobDeletionQueueMessage = { containerName, prefix, ...(createdBefore && { createdBefore }) };
    await getJobQueue(QueueJob.ProcessBlobDeletion).send(data);
  });
