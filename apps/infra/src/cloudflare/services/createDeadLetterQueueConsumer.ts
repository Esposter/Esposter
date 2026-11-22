import type { CloudflareEnvironment, QueueJob } from "@esposter/db-schema";

import JobsWorkerScriptNameMap from "#src/cloudflare/constants/JobsWorkerScriptNameMap";
import QueueConsumerRetryDelay from "#src/cloudflare/constants/QueueConsumerRetryDelay";
import { queueJobResources } from "#src/cloudflare/services/queueJobResources";
import {
  CLOUDFLARE_ACCOUNT_ID,
  CloudflareAssetType,
  DEAD_LETTER_CONSUMER_MAX_RETRIES,
  getCloudflareResourceName,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

// A dead-letter queue's consumer, which replays its messages through the jobs Worker. It has no dead-letter queue of its own
export const createDeadLetterQueueConsumer = (
  environment: CloudflareEnvironment,
  queueJob: QueueJob,
): cloudflare.QueueConsumer => {
  const { deadLetterQueue } = queueJobResources[environment][queueJob];
  const deadLetterQueueName = getCloudflareResourceName(environment, CloudflareAssetType.DeadLetterQueue, queueJob);
  return new cloudflare.QueueConsumer(
    `${deadLetterQueueName}-consumer`,
    {
      accountId: CLOUDFLARE_ACCOUNT_ID,
      queueId: deadLetterQueue.queueId,
      scriptName: JobsWorkerScriptNameMap[environment],
      settings: { maxRetries: DEAD_LETTER_CONSUMER_MAX_RETRIES, retryDelay: QueueConsumerRetryDelay },
      type: "worker",
    },
    { parent: deadLetterQueue, protect: true },
  );
};
