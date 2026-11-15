import ProdJobsWorkerScriptName from "#src/cloudflare/constants/ProdJobsWorkerScriptName";
import QueueConsumerRetryDelay from "#src/cloudflare/constants/QueueConsumerRetryDelay";
import { prodDlqEsposterProcessWebhook } from "#src/cloudflare/resources/queues/prodDlqEsposterProcessWebhook";
import {
  CLOUDFLARE_ACCOUNT_ID,
  CloudflareAssetType,
  CloudflareEnvironment,
  DEAD_LETTER_CONSUMER_MAX_RETRIES,
  getCloudflareResourceName,
  QueueJob,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const deadLetterQueueName = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.DeadLetterQueue,
  QueueJob.ProcessWebhook,
);

export const prodDlqEsposterProcessWebhookConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${deadLetterQueueName}-consumer`,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    queueId: prodDlqEsposterProcessWebhook.queueId,
    scriptName: ProdJobsWorkerScriptName,
    settings: { maxRetries: DEAD_LETTER_CONSUMER_MAX_RETRIES, retryDelay: QueueConsumerRetryDelay },
    type: "worker",
  },
  { parent: prodDlqEsposterProcessWebhook, protect: true },
);
