import type { R2BucketClient } from "#src/models/cloudflare/R2BucketClient";
import type { StorageBucket } from "@esposter/db-schema";

import { createR2BucketClient } from "#src/services/cloudflare/createR2BucketClient";
import { CloudflareEnvironment } from "@esposter/db-schema";

// The bucket a product's objects are published to, once per environment of the account. Each client is made when the
// Map is, so a caller makes the map only once a publish needs the bucket
export const createHostedAssetBucketClientMap = (
  bucket: StorageBucket,
): Record<CloudflareEnvironment, R2BucketClient> => ({
  [CloudflareEnvironment.Development]: createR2BucketClient(CloudflareEnvironment.Development, bucket),
  [CloudflareEnvironment.Production]: createR2BucketClient(CloudflareEnvironment.Production, bucket),
});
