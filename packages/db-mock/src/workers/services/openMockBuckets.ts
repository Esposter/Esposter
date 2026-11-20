import type { StorageBucket } from "@esposter/db-schema";

import { createMockBuckets } from "#src/createMockBuckets";
import { mockBucketDisposers, mockBuckets } from "#src/workers/services/mockBuckets";

export const openMockBuckets = async (storageBuckets: StorageBucket[]): Promise<void> => {
  const { buckets, dispose } = await createMockBuckets(storageBuckets);
  for (const [storageBucket, bucket] of buckets) mockBuckets.set(storageBucket, bucket);
  mockBucketDisposers.add(dispose);
};
