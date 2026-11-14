import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareLocationHint from "#src/cloudflare/constants/CloudflareLocationHint";
import * as cloudflare from "@pulumi/cloudflare";

export const devR2EsposterResourceAssets: cloudflare.R2Bucket = new cloudflare.R2Bucket(
  "r2Bucket-dev-resource-assets",
  { accountId: CloudflareAccountId, location: CloudflareLocationHint, name: "dev-resource-assets" },
  { protect: true },
);
