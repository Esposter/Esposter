import type { CloudflareEnvironment } from "@esposter/db-schema";

import {
  CLOUDFLARE_ACCOUNT_ID,
  CloudflareAssetType,
  getCloudflareResourceName,
  StorageBucket,
} from "@esposter/db-schema";

// The policy resources an environment's R2 token is scoped to: each of the environment's buckets, named as
// `createR2Bucket` names it, with every action on that bucket
export const getR2BucketResources = (environment: CloudflareEnvironment): Record<string, string> =>
  Object.fromEntries(
    Object.values(StorageBucket).map((storageBucket) => [
      `com.cloudflare.edge.r2.bucket.${CLOUDFLARE_ACCOUNT_ID}_default_${getCloudflareResourceName(environment, CloudflareAssetType.R2Bucket, storageBucket)}`,
      "*",
    ]),
  );
