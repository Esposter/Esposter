import { getContainerClient } from "#src/services/getContainerClient";
import {
  AzureContainer,
  DEAD_LETTER_ARCHIVED_PREFIX,
  DEAD_LETTER_QUARANTINE_PREFIX,
  EVENT_GRID_DELIVERY_TTL_MS,
} from "@esposter/db-schema";

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
    // Time-to-live: past it, no delivery of that trigger can still arrive. A blob whose creation instant is missing
    // Reads as epoch and is drained, because recovering a payload twice is idempotent and losing one is not.
    if (Date.now() - (properties.createdOn?.getTime() ?? 0) < EVENT_GRID_DELIVERY_TTL_MS) continue;
    const blockBlobClient = containerClient.getBlockBlobClient(name);
    const content = await blockBlobClient.downloadToBuffer();
    // Overwritten in place under the same name: the subscription filters on the container path, so a copy under any
    // Other prefix would not match it, and the attempt counter rides on each event's id rather than on the blob —
    // Nothing about the cap is reset by rewriting the bytes.
    await blockBlobClient.upload(content, content.length);
    drainedCount += 1;
  }
  return drainedCount;
};
