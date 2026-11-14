import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareLocationHint from "#src/cloudflare/constants/CloudflareLocationHint";
import * as cloudflare from "@pulumi/cloudflare";

export const genshinAssets: cloudflare.R2Bucket = new cloudflare.R2Bucket(
  "r2Bucket-genshin-assets",
  { accountId: CloudflareAccountId, location: CloudflareLocationHint, name: "genshin-assets" },
  { protect: true },
);
