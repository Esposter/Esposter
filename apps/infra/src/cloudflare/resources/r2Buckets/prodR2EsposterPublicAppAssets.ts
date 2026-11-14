import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareLocationHint from "#src/cloudflare/constants/CloudflareLocationHint";
import * as cloudflare from "@pulumi/cloudflare";

export const prodR2EsposterPublicAppAssets: cloudflare.R2Bucket = new cloudflare.R2Bucket(
  "r2Bucket-public-app-assets",
  { accountId: CloudflareAccountId, location: CloudflareLocationHint, name: "public-app-assets" },
  { protect: true },
);
