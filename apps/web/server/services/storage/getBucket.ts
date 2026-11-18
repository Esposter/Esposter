import type { R2Bucket } from "@cloudflare/workers-types";
import type { StorageBucket } from "@esposter/db-schema";

import { recordStorageBucket } from "#server/services/storage/recordStorageBucket";
import { getStorageBucketBindingName } from "@esposter/db-schema";
import { env } from "cloudflare:workers";

// Every bucket name has a binding declared for it, so the lookup is total over the enum. The binding records the reads and
// Writes its calls make into the request's scope, and records nothing outside one
export const getBucket = (storageBucket: StorageBucket): R2Bucket =>
  recordStorageBucket(storageBucket, Reflect.get(env, getStorageBucketBindingName(storageBucket)));
