import { devR2EsposterPublicHostedAssets } from "#src/cloudflare/resources/r2Buckets/devR2EsposterPublicHostedAssets";
import { getPublicR2BucketCorsRules } from "#src/cloudflare/services/getPublicR2BucketCorsRules";
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
  StorageBucket.PublicHostedAssets,
);

export const devR2EsposterPublicHostedAssetsCors: cloudflare.R2BucketCors = new cloudflare.R2BucketCors(
  `${bucketName}-cors`,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    bucketName: devR2EsposterPublicHostedAssets.name,
    rules: getPublicR2BucketCorsRules(),
  },
  { parent: devR2EsposterPublicHostedAssets, protect: true },
);
