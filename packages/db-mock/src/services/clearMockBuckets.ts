import { emptyR2Bucket } from "#src/services/emptyR2Bucket";
import { mockBuckets } from "#src/services/mockBuckets";

// Empties every bucket a suite opened, so each test starts with nothing in them
export const clearMockBuckets = async (): Promise<void> => {
  await Promise.all(Array.from(mockBuckets.values(), async (bucket) => emptyR2Bucket(bucket)));
};
