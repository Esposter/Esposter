import { QueueJobHandlerMap } from "#src/services/queue/QueueJobHandlerMap";
import { CloudflareAssetType, CloudflareEnvironment, getCloudflareResourceName, QueueJob } from "@esposter/db-schema";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";

// A batch names its queue in this environment's spelling, so its job is the one whose queue name this environment builds
// to the same string. The name is never parsed back into a job, so a name that only resembles one is not mistaken for it.
// One batch is one queue's messages, so its handler is the job's. Each message is acknowledged when its handler resolves
// and retried when it throws, so one failing message neither holds nor repeats the others. Past the job's retry count the
// queue sends the message to the job's dead-letter queue, which keeps what failed.
export const handleQueueBatch = async (
  batch: MessageBatch<unknown>,
  environment: CloudflareEnvironment,
): Promise<void> => {
  const job = Object.values(QueueJob).find(
    (queueJob) => getCloudflareResourceName(environment, CloudflareAssetType.Queue, queueJob) === batch.queue,
  );
  if (!job) throw new InvalidOperationError(Operation.Read, batch.queue, "is not a queue this Worker consumes");

  const handler = QueueJobHandlerMap[job];
  await Promise.all(
    batch.messages.map((message) =>
      getResultAsync(() => handler(message.body)).match(
        () => {
          message.ack();
        },
        (error) => {
          console.error(`${job} failed: `, error);
          message.retry();
        },
      ),
    ),
  );
};
