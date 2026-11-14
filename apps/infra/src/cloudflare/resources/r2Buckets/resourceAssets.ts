import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareLocationHint from "#src/cloudflare/constants/CloudflareLocationHint";
import * as cloudflare from "@pulumi/cloudflare";

export const resourceAssets: cloudflare.R2Bucket = new cloudflare.R2Bucket(
  "r2Bucket-resource-assets",
  { accountId: CloudflareAccountId, location: CloudflareLocationHint, name: "resource-assets" },
  { protect: true },
);
