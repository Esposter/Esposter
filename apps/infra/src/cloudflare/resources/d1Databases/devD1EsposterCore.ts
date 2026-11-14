import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareLocationHint from "#src/cloudflare/constants/CloudflareLocationHint";
import * as cloudflare from "@pulumi/cloudflare";

export const devD1EsposterCore: cloudflare.D1Database = new cloudflare.D1Database(
  "d1Database-dev-core",
  { accountId: CloudflareAccountId, name: "dev-core", primaryLocationHint: CloudflareLocationHint },
  { protect: true },
);
