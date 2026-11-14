import {
  CLOUDFLARE_ACCOUNT_ID,
  CloudflareAssetType,
  CloudflareEnvironment,
  getCloudflareResourceName,
  QueueJob,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const deadLetterQueueName = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.DeadLetterQueue,
  QueueJob.ProcessScheduledMessageJob,
);

export const devDlqEsposterProcessScheduledMessageJob: cloudflare.Queue = new cloudflare.Queue(
  deadLetterQueueName,
  { accountId: CLOUDFLARE_ACCOUNT_ID, queueName: deadLetterQueueName },
  { protect: true },
);
