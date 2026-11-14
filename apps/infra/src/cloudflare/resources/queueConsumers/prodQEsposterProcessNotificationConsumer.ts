import QueueConsumerRetryDelay from "#src/cloudflare/constants/QueueConsumerRetryDelay";
import { prodDlqEsposterProcessNotification } from "#src/cloudflare/resources/queues/prodDlqEsposterProcessNotification";
import { prodQEsposterProcessNotification } from "#src/cloudflare/resources/queues/prodQEsposterProcessNotification";
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
  QueueJob.ProcessNotification,
);
const scriptName = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.Worker,
  CloudflareWorkerPurpose.Functions,
);

export const prodQEsposterProcessNotificationConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${queueName}-consumer`,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    deadLetterQueue: prodDlqEsposterProcessNotification.queueName,
    queueId: prodQEsposterProcessNotification.queueId,
    scriptName,
    settings: { maxRetries: QueueJobMaxRetriesMap[QueueJob.ProcessNotification], retryDelay: QueueConsumerRetryDelay },
    type: "worker",
  },
  { parent: prodQEsposterProcessNotification, protect: true },
);
