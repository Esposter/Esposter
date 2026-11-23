import { prodR2EsposterPublicHostedAssets } from "#src/cloudflare/resources/r2Buckets/prodR2EsposterPublicHostedAssets";
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
  CloudflareEnvironment.Production,
  CloudflareAssetType.R2Bucket,
  StorageBucket.PublicHostedAssets,
);

export const prodR2EsposterPublicHostedAssetsCors: cloudflare.R2BucketCors = new cloudflare.R2BucketCors(
  `${bucketName}-cors`,
  {
    accountId: CLOUDFLARE_ACCOUNT_ID,
    bucketName: prodR2EsposterPublicHostedAssets.name,
    rules: getPublicR2BucketCorsRules(),
  },
  { parent: prodR2EsposterPublicHostedAssets, protect: true },
);
