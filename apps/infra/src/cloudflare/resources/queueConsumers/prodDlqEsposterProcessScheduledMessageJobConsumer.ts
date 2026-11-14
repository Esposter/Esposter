import QueueConsumerRetryDelay from "#src/cloudflare/constants/QueueConsumerRetryDelay";
import { prodDlqEsposterProcessScheduledMessageJob } from "#src/cloudflare/resources/queues/prodDlqEsposterProcessScheduledMessageJob";
import {
  CLOUDFLARE_ACCOUNT_ID,
  CloudflareAssetType,
  CloudflareEnvironment,
  CloudflareWorkerPurpose,
  DEAD_LETTER_CONSUMER_MAX_RETRIES,
  getCloudflareResourceName,
  QueueJob,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const deadLetterQueueName = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.DeadLetterQueue,
  QueueJob.ProcessScheduledMessageJob,
);
const scriptName = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.Worker,
  CloudflareWorkerPurpose.Functions,
);

export const prodDlqEsposterProcessScheduledMessageJobConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${deadLetterQueueName}-consumer`,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    queueId: prodDlqEsposterProcessScheduledMessageJob.queueId,
    scriptName,
    settings: { maxRetries: DEAD_LETTER_CONSUMER_MAX_RETRIES, retryDelay: QueueConsumerRetryDelay },
    type: "worker",
  },
  { parent: prodDlqEsposterProcessScheduledMessageJob, protect: false },
);
