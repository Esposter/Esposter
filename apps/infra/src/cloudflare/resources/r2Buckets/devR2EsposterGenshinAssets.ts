import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareLocationHint from "#src/cloudflare/constants/CloudflareLocationHint";
import {
  CloudflareAssetType,
  CloudflareEnvironment,
  getCloudflareResourceName,
  StorageBucket,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const bucketName = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.R2Bucket,
  StorageBucket.GenshinAssets,
);

export const devR2EsposterGenshinAssets: cloudflare.R2Bucket = new cloudflare.R2Bucket(
  bucketName,
  { accountId: CloudflareAccountId, location: CloudflareLocationHint, name: bucketName },
  { protect: true },
);
