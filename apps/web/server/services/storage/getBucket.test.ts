import type { R2Bucket } from "@cloudflare/workers-types";
import type { StorageBucket } from "@esposter/db-schema";

import { requestBlobsStorage } from "#server/services/storage/requestBlobs";
import { recordStorageBucket } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The buckets a test has made, by storage bucket. A suite that touches one makes it in its own beforeAll
// With createMockBucket and records it here, because the binding it stands in for is read synchronously
export const mockBuckets: Partial<Record<StorageBucket, R2Bucket>> = {};

// A bucket the shared mock database's Miniflare binds under its own name, so a suite that needs one reuses that instance
// Rather than starting a Miniflare of its own. The cast is the one createMockBucket makes: Miniflare types its bucket over
// Undici's Headers, which the Workers R2Bucket's iterators do not satisfy, and the binding is the same object
export const createSharedMockBucket = async (storageBucket: StorageBucket): Promise<R2Bucket> => {
  const { getBucket } = await createMockDb();
  return (await getBucket(storageBucket)) as unknown as R2Bucket;
};

// Registered for every suite in the setup file, so a suite that never makes its bucket fails at the read rather than
// Reaching a binding that does not exist under Node
export const getBucket = (storageBucket: StorageBucket): R2Bucket => {
  const bucket = mockBuckets[storageBucket];

  if (!bucket) throw new InvalidOperationError(Operation.Read, getBucket.name, storageBucket);

  return recordStorageBucket(storageBucket, bucket, () => requestBlobsStorage.getStore());
};
