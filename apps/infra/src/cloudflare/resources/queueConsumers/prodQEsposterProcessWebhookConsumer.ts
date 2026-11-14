import QueueConsumerRetryDelay from "#src/cloudflare/constants/QueueConsumerRetryDelay";
import { prodDlqEsposterProcessWebhook } from "#src/cloudflare/resources/queues/prodDlqEsposterProcessWebhook";
import { prodQEsposterProcessWebhook } from "#src/cloudflare/resources/queues/prodQEsposterProcessWebhook";
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
  QueueJob.ProcessWebhook,
);
const scriptName = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.Worker,
  CloudflareWorkerPurpose.Functions,
);

export const prodQEsposterProcessWebhookConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${queueName}-consumer`,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    deadLetterQueue: prodDlqEsposterProcessWebhook.queueName,
    queueId: prodQEsposterProcessWebhook.queueId,
    scriptName,
    settings: { maxRetries: QueueJobMaxRetriesMap[QueueJob.ProcessWebhook], retryDelay: QueueConsumerRetryDelay },
    type: "worker",
  },
  { parent: prodQEsposterProcessWebhook, protect: true },
);
