import QueueConsumerRetryDelay from "#src/cloudflare/constants/QueueConsumerRetryDelay";
import { devDlqEsposterProcessWebhook } from "#src/cloudflare/resources/queues/devDlqEsposterProcessWebhook";
import { devQEsposterProcessWebhook } from "#src/cloudflare/resources/queues/devQEsposterProcessWebhook";
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
  CloudflareEnvironment.Development,
  CloudflareAssetType.Queue,
  QueueJob.ProcessWebhook,
);
const scriptName = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.Worker,
  CloudflareWorkerPurpose.Functions,
);

export const devQEsposterProcessWebhookConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${queueName}-consumer`,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    deadLetterQueue: devDlqEsposterProcessWebhook.queueName,
    queueId: devQEsposterProcessWebhook.queueId,
    scriptName,
    settings: { maxRetries: QueueJobMaxRetriesMap[QueueJob.ProcessWebhook], retryDelay: QueueConsumerRetryDelay },
    type: "worker",
  },
  { parent: devQEsposterProcessWebhook, protect: true },
);
