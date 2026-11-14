import {
  CLOUDFLARE_ACCOUNT_ID,
  CloudflareAssetType,
  CloudflareEnvironment,
  getCloudflareResourceName,
  QueueJob,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const queueName = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.Queue,
  QueueJob.DeleteAccount,
);

export const devQEsposterDeleteAccount: cloudflare.Queue = new cloudflare.Queue(
  queueName,
  { accountId: CLOUDFLARE_ACCOUNT_ID, queueName },
  { protect: true },
);
