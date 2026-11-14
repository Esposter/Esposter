import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareLocationHint from "#src/cloudflare/constants/CloudflareLocationHint";
import * as cloudflare from "@pulumi/cloudflare";

export const prodD1EsposterCore: cloudflare.D1Database = new cloudflare.D1Database(
  "d1Database-core",
  { accountId: CloudflareAccountId, name: "core", primaryLocationHint: CloudflareLocationHint },
  { protect: true },
);
