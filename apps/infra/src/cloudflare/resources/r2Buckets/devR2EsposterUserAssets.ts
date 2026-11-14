import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareLocationHint from "#src/cloudflare/constants/CloudflareLocationHint";
import * as cloudflare from "@pulumi/cloudflare";

export const devR2EsposterUserAssets: cloudflare.R2Bucket = new cloudflare.R2Bucket(
  "r2Bucket-dev-user-assets",
  { accountId: CloudflareAccountId, location: CloudflareLocationHint, name: "dev-user-assets" },
  { protect: true },
);
