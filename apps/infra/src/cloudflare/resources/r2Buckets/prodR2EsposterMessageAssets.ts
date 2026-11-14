import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareLocationHint from "#src/cloudflare/constants/CloudflareLocationHint";
import * as cloudflare from "@pulumi/cloudflare";

export const prodR2EsposterMessageAssets: cloudflare.R2Bucket = new cloudflare.R2Bucket(
  "r2Bucket-message-assets",
  { accountId: CloudflareAccountId, location: CloudflareLocationHint, name: "message-assets" },
  { protect: true },
);
