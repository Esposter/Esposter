import {
  CLOUDFLARE_ACCOUNT_ID,
  CloudflareAssetType,
  CloudflareEnvironment,
  getCloudflareResourceName,
  QueueJob,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const deadLetterQueueName = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.DeadLetterQueue,
  QueueJob.DeleteAccount,
);

export const prodDlqEsposterDeleteAccount: cloudflare.Queue = new cloudflare.Queue(
  deadLetterQueueName,
  { accountId: CLOUDFLARE_ACCOUNT_ID, queueName: deadLetterQueueName },
  { protect: true },
);
