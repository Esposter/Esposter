import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareLocationHint from "#src/cloudflare/constants/CloudflareLocationHint";
import * as cloudflare from "@pulumi/cloudflare";

export const clickerAssets: cloudflare.R2Bucket = new cloudflare.R2Bucket(
  "r2Bucket-clicker-assets",
  { accountId: CloudflareAccountId, location: CloudflareLocationHint, name: "clicker-assets" },
  { protect: true },
);
