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
  CloudflareEnvironment.Production,
  CloudflareAssetType.Queue,
  toKebabCase(AzureFunction.DeleteOrphanedProfileImage),
);

export const prodQEsposterDeleteOrphanedProfileImage: cloudflare.Queue = new cloudflare.Queue(
  queueName,
  { accountId: CloudflareAccountId, queueName: queueName },
  { protect: true },
);
