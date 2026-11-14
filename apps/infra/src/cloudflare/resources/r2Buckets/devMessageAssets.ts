import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareLocationHint from "#src/cloudflare/constants/CloudflareLocationHint";
import * as cloudflare from "@pulumi/cloudflare";

export const devMessageAssets: cloudflare.R2Bucket = new cloudflare.R2Bucket(
  "r2Bucket-dev-message-assets",
  { accountId: CloudflareAccountId, location: CloudflareLocationHint, name: "dev-message-assets" },
  { protect: true },
);
