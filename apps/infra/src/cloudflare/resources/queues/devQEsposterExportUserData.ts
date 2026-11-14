import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import { CloudflareAssetType, CloudflareEnvironment, getCloudflareResourceName, QueueJob } from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const queueName = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.Queue,
  QueueJob.ExportUserData,
);

export const devQEsposterExportUserData: cloudflare.Queue = new cloudflare.Queue(
  queueName,
  { accountId: CloudflareAccountId, queueName },
  { protect: true },
);
