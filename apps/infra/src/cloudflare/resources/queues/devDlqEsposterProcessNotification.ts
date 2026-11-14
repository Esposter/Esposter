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
  CloudflareEnvironment.Development,
  CloudflareAssetType.DeadLetterQueue,
  toKebabCase(AzureFunction.ProcessNotification),
);

export const devDlqEsposterProcessNotification: cloudflare.Queue = new cloudflare.Queue(
  deadLetterQueueName,
  { accountId: CloudflareAccountId, queueName: deadLetterQueueName },
  { protect: true },
);
