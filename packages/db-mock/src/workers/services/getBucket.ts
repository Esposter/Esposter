import type { R2Bucket } from "@cloudflare/workers-types";
import type { StorageBucket } from "@esposter/db-schema";

import { mockBuckets } from "#src/workers/services/mockBuckets";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Registered per suite, so a suite that never opens the bucket it reads fails at the read.
// Otherwise it would reach a binding that does not exist under Node
export const getBucket = (storageBucket: StorageBucket): R2Bucket => {
  const bucket = mockBuckets.get(storageBucket);
  if (!bucket) throw new InvalidOperationError(Operation.Read, getBucket.name, storageBucket);

  return bucket;
};
