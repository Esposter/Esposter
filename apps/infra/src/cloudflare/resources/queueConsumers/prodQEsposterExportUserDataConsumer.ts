import QueueConsumerRetryDelay from "#src/cloudflare/constants/QueueConsumerRetryDelay";
import { prodDlqEsposterExportUserData } from "#src/cloudflare/resources/queues/prodDlqEsposterExportUserData";
import { prodQEsposterExportUserData } from "#src/cloudflare/resources/queues/prodQEsposterExportUserData";
import {
  CLOUDFLARE_ACCOUNT_ID,
  CloudflareAssetType,
  CloudflareEnvironment,
  CloudflareWorkerPurpose,
  getCloudflareResourceName,
  QueueJob,
  QueueJobMaxRetriesMap,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const queueName = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.Queue,
  QueueJob.ExportUserData,
);
const scriptName = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.Worker,
  CloudflareWorkerPurpose.Functions,
);

export const prodQEsposterExportUserDataConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${queueName}-consumer`,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    deadLetterQueue: prodDlqEsposterExportUserData.queueName,
    queueId: prodQEsposterExportUserData.queueId,
    scriptName,
    settings: { maxRetries: QueueJobMaxRetriesMap[QueueJob.ExportUserData], retryDelay: QueueConsumerRetryDelay },
    type: "worker",
  },
  { parent: prodQEsposterExportUserData, protect: true },
);
