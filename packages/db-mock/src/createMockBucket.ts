import type { R2Bucket } from "@cloudflare/workers-types";

import { createMockBuckets } from "#src/createMockBuckets";
import { takeOne } from "@esposter/shared";

// An in-memory R2 bucket, the binding a Worker gets, served by Miniflare under the bucket's own name. The instance is
// Handed back beside the bucket so the test that made it can dispose it
export const createMockBucket = async (
  bucketName: string,
): Promise<{ bucket: R2Bucket; dispose: () => Promise<void> }> => {
  const { buckets, dispose } = await createMockBuckets([bucketName]);
  return { bucket: takeOne([...buckets.values()], 0), dispose };
};
