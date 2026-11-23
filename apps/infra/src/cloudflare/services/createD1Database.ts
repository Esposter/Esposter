import type { CloudflareDatabaseRole, CloudflareEnvironment } from "@esposter/db-schema";

import CloudflareLocationHint from "#src/cloudflare/constants/CloudflareLocationHint";
import { cloudflareProvider } from "#src/cloudflare/providers/cloudflareProvider";
import { CLOUDFLARE_ACCOUNT_ID, CloudflareAssetType, getCloudflareResourceName } from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

export const createD1Database = (
  environment: CloudflareEnvironment,
  role: CloudflareDatabaseRole,
): cloudflare.D1Database => {
  const databaseName = getCloudflareResourceName(environment, CloudflareAssetType.D1Database, role);
  return new cloudflare.D1Database(
    databaseName,
    { accountId: CLOUDFLARE_ACCOUNT_ID, name: databaseName, primaryLocationHint: CloudflareLocationHint },
    { protect: true, provider: cloudflareProvider },
  );
};
