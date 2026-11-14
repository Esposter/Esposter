import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareLocationHint from "#src/cloudflare/constants/CloudflareLocationHint";
import * as cloudflare from "@pulumi/cloudflare";

export const prodR2EsposterUserAssets: cloudflare.R2Bucket = new cloudflare.R2Bucket(
  "r2Bucket-user-assets",
  { accountId: CloudflareAccountId, location: CloudflareLocationHint, name: "user-assets" },
  { protect: true },
);
