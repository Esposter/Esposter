import type { CloudflareEnvironment, QueueJob } from "@esposter/db-schema";

import JobsWorkerScriptNameMap from "#src/cloudflare/constants/JobsWorkerScriptNameMap";
import QueueConsumerRetryDelay from "#src/cloudflare/constants/QueueConsumerRetryDelay";
import { cloudflareProvider } from "#src/cloudflare/providers/cloudflareProvider";
import { queueJobResources } from "#src/cloudflare/services/queueJobResources";
import {
  CLOUDFLARE_ACCOUNT_ID,
  CloudflareAssetType,
  getCloudflareResourceName,
  QueueJobMaxRetriesMap,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

// A job's queue consumer, which delivers its queue to the jobs Worker and sends a batch that exhausts its retries to the
// Dead-letter queue
export const createQueueConsumer = (
  environment: CloudflareEnvironment,
  queueJob: QueueJob,
): cloudflare.QueueConsumer => {
  const { deadLetterQueue, queue } = queueJobResources[environment][queueJob];
  const queueName = getCloudflareResourceName(environment, CloudflareAssetType.Queue, queueJob);
  return new cloudflare.QueueConsumer(
    `${queueName}-consumer`,
    {
      accountId: CLOUDFLARE_ACCOUNT_ID,
      deadLetterQueue: deadLetterQueue.queueName,
      queueId: queue.queueId,
      scriptName: JobsWorkerScriptNameMap[environment],
      settings: { maxRetries: QueueJobMaxRetriesMap[queueJob], retryDelay: QueueConsumerRetryDelay },
      type: "worker",
    },
    { parent: queue, protect: true, provider: cloudflareProvider },
  );
};
