import type { R2Bucket } from "@cloudflare/workers-types";
import type { StorageBucket } from "@esposter/db-schema";

import { mockBuckets } from "#server/services/storage/getBucket.test";
import { setupMockBucket } from "@esposter/db-mock/vitest";
import { afterAll, beforeAll, describe } from "vitest";

// The suite's in-memory bucket for one storage bucket, recorded where `getBucket` reads it for the suite's tests and
// Disposed after them. A suite that seeds it, or clears it between tests, does so in its own hooks, which run after
// These before its tests and before these after them
export const setupMockStorageBucket = (storageBucket: StorageBucket): { getMockBucket: () => R2Bucket } => {
  const { getBucket: getMockBucket } = setupMockBucket(storageBucket);

  beforeAll(() => {
    mockBuckets[storageBucket] = getMockBucket();
  });

  afterAll(() => {
    delete mockBuckets[storageBucket];
  });

  return { getMockBucket };
};

// Fixtures only: a suite here would run again in every file that imports them
describe.todo("setupMockStorageBucket");
