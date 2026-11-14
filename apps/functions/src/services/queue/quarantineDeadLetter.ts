import { getBucket } from "#src/services/storage/getBucket";
import { StorageBucket } from "@esposter/db-schema";

// A dead letter that cannot be republished is written once, as its raw body, under the queue it failed in and its message id,
// so a person can read what failed. UserAssets is the private bucket with no event notification and no lifecycle, so the write
// starts no storage reconcile and nothing expires it. The write is create-only: a redelivery of the same message finds the object
// already there and does not write it again, so only the delivery that wrote it logs
export const quarantineDeadLetter = async (
  message: Message<unknown>,
  queueName: string,
  reason: unknown,
): Promise<void> => {
  const key = `quarantine/${queueName}/${message.id}.json`;
  const written = await getBucket(StorageBucket.UserAssets).put(key, JSON.stringify(message.body), {
    onlyIf: { etagDoesNotMatch: "*" },
  });
  if (written) console.error(`${queueName} dead letter quarantined at ${key}: `, reason);
};
