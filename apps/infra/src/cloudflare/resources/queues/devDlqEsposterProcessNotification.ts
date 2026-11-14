import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import { CloudflareAssetType, CloudflareEnvironment, getCloudflareResourceName, QueueJob } from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const deadLetterQueueName = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.DeadLetterQueue,
  QueueJob.ProcessNotification,
);

export const devDlqEsposterProcessNotification: cloudflare.Queue = new cloudflare.Queue(
  deadLetterQueueName,
  { accountId: CloudflareAccountId, queueName: deadLetterQueueName },
  { protect: true },
);
