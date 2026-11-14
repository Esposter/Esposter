import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareLocationHint from "#src/cloudflare/constants/CloudflareLocationHint";
import {
  CloudflareAssetType,
  CloudflareDatabaseRole,
  CloudflareEnvironment,
  getCloudflareResourceName,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const databaseName = getCloudflareResourceName(
  CloudflareEnvironment.Production,
  CloudflareAssetType.D1Database,
  CloudflareDatabaseRole.Core,
);

export const prodD1EsposterCore: cloudflare.D1Database = new cloudflare.D1Database(
  databaseName,
  { accountId: CloudflareAccountId, name: databaseName, primaryLocationHint: CloudflareLocationHint },
  { protect: true },
);
