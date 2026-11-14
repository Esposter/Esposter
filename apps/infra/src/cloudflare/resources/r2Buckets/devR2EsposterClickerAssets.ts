import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareLocationHint from "#src/cloudflare/constants/CloudflareLocationHint";
import * as cloudflare from "@pulumi/cloudflare";

export const devR2EsposterClickerAssets: cloudflare.R2Bucket = new cloudflare.R2Bucket(
  "r2Bucket-dev-clicker-assets",
  { accountId: CloudflareAccountId, location: CloudflareLocationHint, name: "dev-clicker-assets" },
  { protect: true },
);
