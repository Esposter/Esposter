import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import { CloudflareAssetType, CloudflareEnvironment, getCloudflareResourceName, QueueJob } from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const queueName = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.Queue,
  QueueJob.ExportUserData,
);

export const prodQEsposterExportUserData: cloudflare.Queue = new cloudflare.Queue(
  queueName,
  { accountId: CloudflareAccountId, queueName },
  { protect: true },
);
