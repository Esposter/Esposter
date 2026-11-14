import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareLocationHint from "#src/cloudflare/constants/CloudflareLocationHint";
import * as cloudflare from "@pulumi/cloudflare";

export const devR2EsposterPublicDungeonsAssets: cloudflare.R2Bucket = new cloudflare.R2Bucket(
  "r2Bucket-dev-public-dungeons-assets",
  { accountId: CloudflareAccountId, location: CloudflareLocationHint, name: "dev-public-dungeons-assets" },
  { protect: true },
);
