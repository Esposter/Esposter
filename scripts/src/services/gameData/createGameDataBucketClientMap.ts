import type { R2BucketClient } from "#src/models/cloudflare/R2BucketClient";

import { createR2BucketClient } from "#src/services/cloudflare/createR2BucketClient";
import { CloudflareEnvironment, StorageBucket } from "@esposter/db-schema";

// The bucket every game data object is published to, once per environment of the account. Each client is made when the map
// Is, so a caller makes the map only once a publish needs the bucket
export const createGameDataBucketClientMap = (): Record<CloudflareEnvironment, R2BucketClient> => ({
  [CloudflareEnvironment.Development]: createR2BucketClient(
    CloudflareEnvironment.Development,
    StorageBucket.PublicGenshinAssets,
  ),
  [CloudflareEnvironment.Production]: createR2BucketClient(
    CloudflareEnvironment.Production,
    StorageBucket.PublicGenshinAssets,
  ),
});
