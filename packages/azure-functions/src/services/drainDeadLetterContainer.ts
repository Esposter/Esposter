import { getContainerClient } from "#src/services/getContainerClient";
import { checkIsPreconditionFailed } from "@esposter/db";
import {
  AzureContainer,
  DEAD_LETTER_ARCHIVED_PREFIX,
  DEAD_LETTER_QUARANTINE_PREFIX,
  EVENT_GRID_DELIVERY_TTL_MS,
} from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

// A dead letter is replayed by the `BlobCreated` event its own write raises, and that event is delivered like any
// Other: ten attempts over an hour, against an endpoint that is this very Function App. An app that is down for
// Longer than that window therefore never sees its own trigger, and the replay subscription deliberately carries no
// `deadLetterDestination` — one would write into the container it watches — so the trigger is dropped rather than
// Dead-lettered. The blob is then stranded at the container root with nothing left to notice it, which is not the
// Subscription-teardown window the runbook reasons about: the subscription is alive throughout.
// Re-uploading the blob raises a fresh `BlobCreated`, which is exactly the remediation the runbook documents for a
// Stranded payload. Doing it here makes that move automatic at the one moment the endpoint is known to be back, so
// It is not a sweep: nothing is scheduled, and every start that follows a healthy one finds nothing to do
// (/docs/infra/eventgrid-dead-letter).
export const drainDeadLetterContainer = async (): Promise<number> => {
  const containerClient = await getContainerClient(AzureContainer.DeadLetter);
  let drainedCount = 0;
  for await (const { name, properties } of containerClient.listBlobsFlat()) {
    // The replay's own copies. The subscription filters both prefixes out, so re-uploading one would retrigger
    // Nothing and would only rewrite the record an operator reads.
    if (name.startsWith(DEAD_LETTER_ARCHIVED_PREFIX) || name.startsWith(DEAD_LETTER_QUARANTINE_PREFIX)) continue;
    // Still inside its own delivery window, so it is not stranded — its trigger has attempts left, and re-uploading
    // Would race the delivery still coming and publish the batch twice. The bound is the subscription's own
    // Time-to-live: past it, no delivery of that trigger can still arrive. A blob whose instant is missing reads as
    // Epoch and is drained, because recovering a payload twice is idempotent and losing one is not.
    // `lastModified`, never `createdOn`: overwriting a blob advances the former and leaves the latter at the write
    // Event Grid made. Keyed on `createdOn` a drained blob stays permanently older than the cutoff, so every later
    // Cold start drains it again and republishes the same batch — forever, since nothing about the re-upload can
    // Move the value being compared.
    if (Date.now() - (properties.lastModified?.getTime() ?? 0) < EVENT_GRID_DELIVERY_TTL_MS) continue;
    const blockBlobClient = containerClient.getBlockBlobClient(name);
    const content = await blockBlobClient.downloadToBuffer();
    // Overwritten in place under the same name: the subscription filters on the container path, so a copy under any
    // Other prefix would not match it, and the attempt counter rides on each event's id rather than on the blob —
    // Nothing about the cap is reset by rewriting the bytes.
    // `ifMatch` makes the re-upload a claim rather than a blind write. Every worker cold-starts its own drain, so
    // On a scale-out several list the same stranded blob before any of them writes; unconditional, each would
    // Raise its own trigger and the batch would be republished once per worker. That is not merely wasteful — the
    // Replay cap is small, so the duplicates burn it in one round and quarantine a payload that had attempts left.
    // Whoever writes first re-mints the etag, and the losers are refused with a 412 they treat as "already
    // Claimed": not this worker's to drain, and nothing to report.
    const isClaimed = await getResultAsync(() =>
      blockBlobClient.upload(content, content.length, { conditions: { ifMatch: properties.etag } }),
    ).match(
      () => true,
      (error) => {
        if (checkIsPreconditionFailed(error)) return false;
        throw error;
      },
    );
    if (isClaimed) drainedCount += 1;
  }
  return drainedCount;
};
