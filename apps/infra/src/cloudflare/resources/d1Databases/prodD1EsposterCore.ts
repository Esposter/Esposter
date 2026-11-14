import CloudflareLocationHint from "#src/cloudflare/constants/CloudflareLocationHint";
import {
  CLOUDFLARE_ACCOUNT_ID,
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
  { accountId: CLOUDFLARE_ACCOUNT_ID, name: databaseName, primaryLocationHint: CloudflareLocationHint },
  { protect: true },
);
