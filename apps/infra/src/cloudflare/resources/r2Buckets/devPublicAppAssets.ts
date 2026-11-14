import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareLocationHint from "#src/cloudflare/constants/CloudflareLocationHint";
import * as cloudflare from "@pulumi/cloudflare";

export const devPublicAppAssets: cloudflare.R2Bucket = new cloudflare.R2Bucket(
  "r2Bucket-dev-public-app-assets",
  { accountId: CloudflareAccountId, location: CloudflareLocationHint, name: "dev-public-app-assets" },
  { protect: true },
);
