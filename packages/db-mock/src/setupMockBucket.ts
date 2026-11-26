import type { R2Bucket } from "@cloudflare/workers-types";

import { createMockBucket } from "#src/createMockBucket";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { afterAll, beforeAll } from "vitest";

// One in-memory R2 bucket for a suite, made before its tests and disposed after them. Called at `describe` scope, so its
// Before-hook runs ahead of the suite's own and its after-hook behind them. A setup that failed made no bucket, so the
// After-hook disposes only what was made, and the setup's own error is the one reported
export const setupMockBucket = (bucketName: string): { getBucket: () => R2Bucket } => {
  let mockBucket: Awaited<ReturnType<typeof createMockBucket>> | undefined;

  beforeAll(async () => {
    mockBucket = await createMockBucket(bucketName);
  });

  afterAll(async () => {
    await mockBucket?.dispose();
  });

  return {
    getBucket: () => {
      if (!mockBucket) throw new InvalidOperationError(Operation.Read, setupMockBucket.name, bucketName);
      return mockBucket.bucket;
    },
  };
};
