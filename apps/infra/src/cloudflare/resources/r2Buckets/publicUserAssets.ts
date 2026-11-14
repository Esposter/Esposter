import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareLocationHint from "#src/cloudflare/constants/CloudflareLocationHint";
import * as cloudflare from "@pulumi/cloudflare";

export const publicUserAssets: cloudflare.R2Bucket = new cloudflare.R2Bucket(
  "r2Bucket-public-user-assets",
  { accountId: CloudflareAccountId, location: CloudflareLocationHint, name: "public-user-assets" },
  { protect: true },
);
