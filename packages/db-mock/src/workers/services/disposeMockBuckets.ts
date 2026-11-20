import { mockBucketDisposers, mockBuckets } from "#src/workers/services/mockBuckets";

export const disposeMockBuckets = async (): Promise<void> => {
  mockBuckets.clear();
  const pendingDisposers = [...mockBucketDisposers];
  mockBucketDisposers.clear();
  await Promise.all(pendingDisposers.map(async (dispose) => dispose()));
};
