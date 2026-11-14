import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import {
  AzureFunction,
  CloudflareAssetType,
  CloudflareEnvironment,
  getCloudflareResourceName,
} from "@esposter/db-schema";
import { toKebabCase } from "@esposter/shared";
import * as cloudflare from "@pulumi/cloudflare";

const deadLetterQueueName = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.DeadLetterQueue,
  toKebabCase(AzureFunction.ExportUserData),
);

export const prodDlqEsposterExportUserData: cloudflare.Queue = new cloudflare.Queue(
  deadLetterQueueName,
  { accountId: CloudflareAccountId, queueName: deadLetterQueueName },
  { protect: true },
);
