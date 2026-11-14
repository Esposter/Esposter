import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import { CloudflareAssetType, CloudflareEnvironment, getCloudflareResourceName, QueueJob } from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const deadLetterQueueName = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.DeadLetterQueue,
  QueueJob.DeleteAccount,
);

export const prodDlqEsposterDeleteAccount: cloudflare.Queue = new cloudflare.Queue(
  deadLetterQueueName,
  { accountId: CloudflareAccountId, queueName: deadLetterQueueName },
  { protect: true },
);
