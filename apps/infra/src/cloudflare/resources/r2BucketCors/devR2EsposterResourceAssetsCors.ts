import { devR2EsposterResourceAssets } from "#src/cloudflare/resources/r2Buckets/devR2EsposterResourceAssets";
import { getR2BucketCorsRules } from "#src/cloudflare/services/getR2BucketCorsRules";
import {
  CLOUDFLARE_ACCOUNT_ID,
  CloudflareAssetType,
  CloudflareEnvironment,
  getCloudflareResourceName,
  StorageBucket,
} from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const bucketName = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.R2Bucket,
  StorageBucket.ResourceAssets,
);

export const devR2EsposterResourceAssetsCors: cloudflare.R2BucketCors = new cloudflare.R2BucketCors(
  `${bucketName}-cors`,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    bucketName: devR2EsposterResourceAssets.name,
    rules: getR2BucketCorsRules(CloudflareEnvironment.Development),
  },
  { parent: devR2EsposterResourceAssets, protect: true },
);
