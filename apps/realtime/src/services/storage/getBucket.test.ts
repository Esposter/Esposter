import type { R2Bucket } from "@cloudflare/workers-types";
import type { StorageBucket } from "@esposter/db-schema";

import { deleteDirectory } from "@esposter/db";
import { createMockBuckets } from "@esposter/db-mock";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { describe } from "vitest";

// The buckets a suite has opened, all served by one Miniflare instance that the suite disposes.
// A suite opens the buckets it touches in its beforeAll, because the binding this stands in for is read synchronously
const mockBuckets = new Map<StorageBucket, R2Bucket>();
let disposers: (() => Promise<void>)[] = [];

export const openMockBuckets = async (storageBuckets: StorageBucket[]): Promise<void> => {
  const { buckets, dispose } = await createMockBuckets(storageBuckets);
  for (const [storageBucket, bucket] of buckets) mockBuckets.set(storageBucket, bucket);
  disposers.push(dispose);
};

export const clearMockBuckets = async (): Promise<void> => {
  await Promise.all(Array.from(mockBuckets.values(), async (bucket) => deleteDirectory(bucket)));
};

export const disposeMockBuckets = async (): Promise<void> => {
  mockBuckets.clear();
  const pendingDisposers = disposers;
  disposers = [];
  await Promise.all(pendingDisposers.map(async (dispose) => dispose()));
};

// Registered per suite, so a suite that never opens the bucket it reads fails at the read.
// Otherwise it would reach a binding that does not exist under Node
export const getBucket = (storageBucket: StorageBucket): R2Bucket => {
  const bucket = mockBuckets.get(storageBucket);
  if (!bucket) throw new InvalidOperationError(Operation.Read, getBucket.name, storageBucket);

  return bucket;
};

describe.todo("getBucket");
