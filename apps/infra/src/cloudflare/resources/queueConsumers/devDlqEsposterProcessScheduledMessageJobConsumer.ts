import QueueConsumerRetryDelay from "#src/cloudflare/constants/QueueConsumerRetryDelay";
import { devDlqEsposterProcessScheduledMessageJob } from "#src/cloudflare/resources/queues/devDlqEsposterProcessScheduledMessageJob";
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
  CloudflareEnvironment.Development,
  CloudflareAssetType.DeadLetterQueue,
  QueueJob.ProcessScheduledMessageJob,
);
const scriptName = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.Worker,
  CloudflareWorkerPurpose.Functions,
);

export const devDlqEsposterProcessScheduledMessageJobConsumer: cloudflare.QueueConsumer = new cloudflare.QueueConsumer(
  `${deadLetterQueueName}-consumer`,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    queueId: devDlqEsposterProcessScheduledMessageJob.queueId,
    scriptName,
    settings: { maxRetries: DEAD_LETTER_CONSUMER_MAX_RETRIES, retryDelay: QueueConsumerRetryDelay },
    type: "worker",
  },
  { parent: devDlqEsposterProcessScheduledMessageJob, protect: false },
);
