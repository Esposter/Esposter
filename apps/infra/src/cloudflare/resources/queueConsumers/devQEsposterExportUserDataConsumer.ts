import DevJobsWorkerScriptName from "#src/cloudflare/constants/DevJobsWorkerScriptName";
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
  CloudflareEnvironment.Development,
  CloudflareAssetType.Queue,
  QueueJob.ExportUserData,
);
const { deadLetterQueue, queue } = queueJobResources[CloudflareEnvironment.Development][QueueJob.ExportUserData];

export const devQEsposterExportUserDataConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${queueName}-consumer`,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    deadLetterQueue: deadLetterQueue.queueName,
    queueId: queue.queueId,
    scriptName: DevJobsWorkerScriptName,
    settings: { maxRetries: QueueJobMaxRetriesMap[QueueJob.ExportUserData], retryDelay: QueueConsumerRetryDelay },
    type: "worker",
  },
  { parent: queue, protect: true },
);
