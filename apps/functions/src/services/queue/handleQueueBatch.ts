import { getQueueMessageHandler } from "#src/services/queue/getQueueMessageHandler";
import { CloudflareEnvironment } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

// A batch names its queue in this environment's spelling, and that name finds the handler for the batch: a job's own, or the
// dead-letter replay of a job's dead letters. One batch is one queue's messages. Each message is acknowledged when its
// handling resolves and retried when it throws, so one failing message neither holds nor repeats the others. Past the job's
// retry count the queue sends the message to the job's dead-letter queue, which keeps what failed until its replay settles it.
export const handleQueueBatch = async (
  batch: MessageBatch<unknown>,
  environment: CloudflareEnvironment,
): Promise<void> => {
  const handleMessage = getQueueMessageHandler(batch.queue, environment);
  await Promise.all(
    batch.messages.map((message) =>
      getResultAsync(() => handleMessage(message)).match(
        () => {
          message.ack();
        },
        (error) => {
          console.error(`${batch.queue} failed: `, error);
          message.retry();
        },
      ),
    ),
  );
};
