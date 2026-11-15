import type { R2Bucket } from "@cloudflare/workers-types";
import type { StorageBucket } from "@esposter/db-schema";

import { getStorageBucketBindingName } from "@esposter/db-schema";
import { env } from "cloudflare:workers";

// Every bucket name has a binding declared for it, so the lookup is total over the enum
export const getBucket = (storageBucket: StorageBucket): R2Bucket =>
  Reflect.get(env, getStorageBucketBindingName(storageBucket));
