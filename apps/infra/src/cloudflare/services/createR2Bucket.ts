import type { CloudflareEnvironment, StorageBucket } from "@esposter/db-schema";

import CloudflareLocationHint from "#src/cloudflare/constants/CloudflareLocationHint";
import { CLOUDFLARE_ACCOUNT_ID, CloudflareAssetType, getCloudflareResourceName } from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

export const createR2Bucket = (environment: CloudflareEnvironment, storageBucket: StorageBucket) => {
  const bucketName = getCloudflareResourceName(environment, CloudflareAssetType.R2Bucket, storageBucket);
  return new cloudflare.R2Bucket(
    bucketName,
    { accountId: CLOUDFLARE_ACCOUNT_ID, location: CloudflareLocationHint, name: bucketName },
    { protect: true },
  );
};
