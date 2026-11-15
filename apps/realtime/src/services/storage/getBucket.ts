import type { R2Bucket } from "@cloudflare/workers-types";
import type { StorageBucket } from "@esposter/db-schema";

import { getStorageBucketBindingName } from "@esposter/db-schema";
import { env } from "cloudflare:workers";

// This Worker binds only the resource-assets bucket, as RESOURCE_ASSETS in wrangler.jsonc, so getBucket is only called for it
// A bucket it does not bind has no binding to read
export const getBucket = (storageBucket: StorageBucket): R2Bucket =>
  Reflect.get(env, getStorageBucketBindingName(storageBucket));
