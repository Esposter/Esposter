import ProdJobsWorkerScriptName from "#src/cloudflare/constants/ProdJobsWorkerScriptName";
import QueueConsumerRetryDelay from "#src/cloudflare/constants/QueueConsumerRetryDelay";
import { queueJobResources } from "#src/cloudflare/services/queueJobResources";
import {
  CLOUDFLARE_ACCOUNT_ID,
  CloudflareAssetType,
  CloudflareEnvironment,
  getCloudflareResourceName,
  QueueJob,
  QueueJobMaxRetriesMap,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const queueName = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.Queue,
  QueueJob.ProcessBlobDeletion,
);
const { deadLetterQueue, queue } = queueJobResources[CloudflareEnvironment.Production][QueueJob.ProcessBlobDeletion];

export const prodQEsposterProcessBlobDeletionConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${queueName}-consumer`,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    deadLetterQueue: deadLetterQueue.queueName,
    queueId: queue.queueId,
    scriptName: ProdJobsWorkerScriptName,
    settings: { maxRetries: QueueJobMaxRetriesMap[QueueJob.ProcessBlobDeletion], retryDelay: QueueConsumerRetryDelay },
    type: "worker",
  },
  { parent: queue, protect: true },
);
