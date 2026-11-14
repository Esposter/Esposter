import type { R2Bucket } from "@cloudflare/workers-types";
import type { StorageBucket } from "@esposter/db-schema";

import { deleteDirectory } from "@esposter/db";
import { createMockBucket } from "@esposter/db-mock";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { describe } from "vitest";

// The buckets a suite has opened, each served by its own Miniflare instance so the suite can dispose it. A suite
// opens the buckets it touches in its beforeAll, because the binding this stands in for is read synchronously
const mockBuckets = new Map<StorageBucket, R2Bucket>();
const disposers: (() => Promise<void>)[] = [];

export const openMockBuckets = async (storageBuckets: StorageBucket[]): Promise<void> => {
  const openedBuckets = await Promise.all(
    storageBuckets.map(async (storageBucket) => ({ storageBucket, ...(await createMockBucket(storageBucket)) })),
  );
  for (const { bucket, dispose, storageBucket } of openedBuckets) {
    mockBuckets.set(storageBucket, bucket);
    disposers.push(dispose);
  }
};

export const clearMockBuckets = async (): Promise<void> => {
  await Promise.all([...mockBuckets.values()].map(async (bucket) => deleteDirectory(bucket)));
};

export const disposeMockBuckets = async (): Promise<void> => {
  mockBuckets.clear();
  await Promise.all(disposers.splice(0).map(async (dispose) => dispose()));
};

// Registered per suite, so a suite that never opens the bucket it reads fails at the read rather than reaching a
// binding that does not exist under Node
export const getBucket = (storageBucket: StorageBucket): R2Bucket => {
  const bucket = mockBuckets.get(storageBucket);
  if (!bucket) throw new InvalidOperationError(Operation.Read, getBucket.name, storageBucket);

  return bucket;
};

describe.todo("getBucket");
