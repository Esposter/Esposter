import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareLocationHint from "#src/cloudflare/constants/CloudflareLocationHint";
import * as cloudflare from "@pulumi/cloudflare";

export const devResourceAssets: cloudflare.R2Bucket = new cloudflare.R2Bucket(
  "r2Bucket-dev-resource-assets",
  { accountId: CloudflareAccountId, location: CloudflareLocationHint, name: "dev-resource-assets" },
  { protect: true },
);
