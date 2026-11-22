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
  QueueJob.DeleteOrphanedProfileImage,
);
const { deadLetterQueue, queue } =
  queueJobResources[CloudflareEnvironment.Production][QueueJob.DeleteOrphanedProfileImage];

export const prodQEsposterDeleteOrphanedProfileImageConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${queueName}-consumer`,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    deadLetterQueue: deadLetterQueue.queueName,
    queueId: queue.queueId,
    scriptName: ProdJobsWorkerScriptName,
    settings: {
      maxRetries: QueueJobMaxRetriesMap[QueueJob.DeleteOrphanedProfileImage],
      retryDelay: QueueConsumerRetryDelay,
    },
    type: "worker",
  },
  { parent: queue, protect: true },
);
