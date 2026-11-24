import type { R2Bucket } from "@cloudflare/workers-types";
import type { StorageBucket } from "@esposter/db-schema";

import { getUnitBlobs } from "#src/services/shared/getUnitBlobs";
import { recordStorageBucket } from "@esposter/db";
import { getStorageBucketBindingName } from "@esposter/db-schema";
import { env } from "cloudflare:workers";

// Every bucket name has a binding declared for it, so the lookup is total over the enum. The binding records the reads
// And writes its calls make into the unit of work they run in, and records nothing outside one
export const getBucket = (storageBucket: StorageBucket): R2Bucket =>
  recordStorageBucket(storageBucket, Reflect.get(env, getStorageBucketBindingName(storageBucket)), getUnitBlobs);
