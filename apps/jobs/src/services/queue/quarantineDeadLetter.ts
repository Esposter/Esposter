import { QUARANTINE_PREFIX } from "#src/services/queue/constants";
import { getBucket } from "#src/services/storage/getBucket";
import { StorageBucket } from "@esposter/db-schema";

// A dead letter that cannot be republished is written once, as its raw body, under the queue it failed in and its
// Message id. A person can then read what failed, until the nightly purge removes it past QUARANTINE_RETENTION_MS.
// UserAssets is the private bucket: no event notification, and its one lifecycle rule names only the data
// Exports' prefix. so the write starts no storage reconcile, and the bucket never expires it.
// The write is create-only. A redelivery finds the object already there and writes nothing.
// Only the delivery that wrote the object logs.
export const quarantineDeadLetter = async (message: Message, queueName: string, reason: unknown): Promise<void> => {
  const key = `${QUARANTINE_PREFIX}${queueName}/${message.id}.json`;
  const written = await getBucket(StorageBucket.UserAssets).put(key, JSON.stringify(message.body), {
    onlyIf: { etagDoesNotMatch: "*" },
  });
  if (written) console.error(`${queueName} dead letter quarantined at ${key}:`, reason);
};
