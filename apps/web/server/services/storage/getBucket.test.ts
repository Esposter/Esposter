import type { R2Bucket } from "@cloudflare/workers-types";
import type { StorageBucket } from "@esposter/db-schema";

import { InvalidOperationError, Operation } from "@esposter/shared";

// The buckets a test has made, by storage bucket. A suite that touches one makes it in its own beforeAll with
// createMockBucket and records it here, because the binding it stands in for is read synchronously
export const mockBuckets: Partial<Record<StorageBucket, R2Bucket>> = {};

// Registered for every suite in the setup file, so a suite that never makes its bucket fails at the read rather than
// Reaching a binding that does not exist under Node
export const getBucket = (storageBucket: StorageBucket): R2Bucket => {
  const bucket = mockBuckets[storageBucket];

  if (!bucket) throw new InvalidOperationError(Operation.Read, getBucket.name, storageBucket);

  return bucket;
};
