import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareLocationHint from "#src/cloudflare/constants/CloudflareLocationHint";
import * as cloudflare from "@pulumi/cloudflare";

export const devR2EsposterGenshinAssets: cloudflare.R2Bucket = new cloudflare.R2Bucket(
  "r2Bucket-dev-genshin-assets",
  { accountId: CloudflareAccountId, location: CloudflareLocationHint, name: "dev-genshin-assets" },
  { protect: true },
);
