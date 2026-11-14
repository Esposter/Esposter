import {
  CLOUDFLARE_ACCOUNT_ID,
  CloudflareAssetType,
  CloudflareEnvironment,
  getCloudflareResourceName,
  QueueJob,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const queueName = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.Queue,
  QueueJob.DeleteAccount,
);

export const prodQEsposterDeleteAccount: cloudflare.Queue = new cloudflare.Queue(
  queueName,
  { accountId: CLOUDFLARE_ACCOUNT_ID, queueName },
  { protect: true },
);
