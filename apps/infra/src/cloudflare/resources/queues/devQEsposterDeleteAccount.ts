import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import {
  AzureFunction,
  CloudflareAssetType,
  CloudflareEnvironment,
  getCloudflareResourceName,
} from "@esposter/db-schema";
import { toKebabCase } from "@esposter/shared";
import * as cloudflare from "@pulumi/cloudflare";

const queueName = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.Queue,
  toKebabCase(AzureFunction.DeleteAccount),
);

export const devQEsposterDeleteAccount: cloudflare.Queue = new cloudflare.Queue(
  queueName,
  { accountId: CloudflareAccountId, queueName: queueName },
  { protect: true },
);
