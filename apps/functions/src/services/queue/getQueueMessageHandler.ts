import type { CloudflareEnvironment } from "@esposter/db-schema";

import { findQueueJob } from "#src/services/queue/findQueueJob";
import { handleDeadLetterMessage } from "#src/services/queue/handleDeadLetterMessage";
import { QueueJobHandlerMap } from "#src/services/queue/QueueJobHandlerMap";
import { CloudflareAssetType, getCloudflareResourceName } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The handler for a batch's queue, which names either a job's queue or a job's dead-letter queue.
// A job's queue is handled by the job's own handler.
// A dead-letter queue is handled by dead-letter replay for the job it failed under.
// Its source queue is named by the same naming function, and a queue no job names is refused.
export const getQueueMessageHandler = (
  queueName: string,
  environment: CloudflareEnvironment,
): ((message: Message) => Promise<void>) => {
  const job = findQueueJob(environment, CloudflareAssetType.Queue, queueName);
  if (job) return async (message) => QueueJobHandlerMap[job](message.body);

  const deadLetterJob = findQueueJob(environment, CloudflareAssetType.DeadLetterQueue, queueName);
  if (deadLetterJob) {
    const sourceQueueName = getCloudflareResourceName(environment, CloudflareAssetType.Queue, deadLetterJob);
    return (message) => handleDeadLetterMessage(message, deadLetterJob, sourceQueueName);
  }

  throw new InvalidOperationError(Operation.Read, queueName, "is not a queue this Worker consumes");
};
