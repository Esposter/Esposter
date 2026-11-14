import DeadLetterConsumerMaxRetries from "#src/cloudflare/constants/DeadLetterConsumerMaxRetries";
import QueueConsumerRetryDelay from "#src/cloudflare/constants/QueueConsumerRetryDelay";
import { prodDlqEsposterProcessNotification } from "#src/cloudflare/resources/queues/prodDlqEsposterProcessNotification";
import {
  CLOUDFLARE_ACCOUNT_ID,
  CloudflareAssetType,
  CloudflareEnvironment,
  CloudflareWorkerPurpose,
  getCloudflareResourceName,
  QueueJob,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const deadLetterQueueName = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.DeadLetterQueue,
  QueueJob.ProcessNotification,
);
const scriptName = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.Worker,
  CloudflareWorkerPurpose.Functions,
);

export const prodDlqEsposterProcessNotificationConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${deadLetterQueueName}-consumer`,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    queueId: prodDlqEsposterProcessNotification.queueId,
    scriptName,
    settings: { maxRetries: DeadLetterConsumerMaxRetries, retryDelay: QueueConsumerRetryDelay },
    type: "worker",
  },
  { parent: prodDlqEsposterProcessNotification, protect: true },
);
