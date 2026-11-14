import { getBucket } from "#src/services/storage/getBucket";
import { StorageBucket } from "@esposter/db-schema";

// A dead letter that cannot be republished is written once, as its raw body, under the queue it failed in and its message id.
// A person can then read what failed. UserAssets is the private bucket with no event notification and no lifecycle.
// So the write starts no storage reconcile, and nothing expires it.
// The write is create-only. A redelivery finds the object already there and writes nothing.
// Only the delivery that wrote the object logs.
export const quarantineDeadLetter = async (message: Message, queueName: string, reason: unknown): Promise<void> => {
  const key = `quarantine/${queueName}/${message.id}.json`;
  const written = await getBucket(StorageBucket.UserAssets).put(key, JSON.stringify(message.body), {
    onlyIf: { etagDoesNotMatch: "*" },
  });
  if (written) console.error(`${queueName} dead letter quarantined at ${key}:`, reason);
};
