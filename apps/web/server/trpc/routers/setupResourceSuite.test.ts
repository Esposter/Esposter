import type { Context } from "#server/trpc/context";
import type { DecorateRouterRecord, RouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { getBucket } from "#server/services/storage/getBucket";
import { mockBuckets } from "#server/services/storage/getBucket.test";
import { createCallerFactory } from "#server/trpc";
import { createMockContext } from "#server/trpc/context.test";
import { deleteDirectory } from "@esposter/db";
import { createMockBucket } from "@esposter/db-mock";
import { resourcesInResource, StorageBucket } from "@esposter/db-schema";
import { afterAll, afterEach, beforeAll, describe } from "vitest";

// Resource-suite fixture: owns the mock context, the caller for the resource-typed router under test, and the
// Cleanup every resource suite owes — the content bucket and the resource rows. Suite-specific hooks compose —
// Before-hooks run after these, after-hooks before — so a suite that also writes tables or queues clears those itself.
export const setupResourceSuite = <TRecord extends RouterRecord>(
  resourceRouter: Parameters<typeof createCallerFactory<TRecord>>[0],
) => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRecord>;
  let disposeBucket: (() => Promise<void>) | undefined;

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(resourceRouter)(mockContext);
    const { bucket, dispose } = await createMockBucket(StorageBucket.ResourceAssets);
    mockBuckets[StorageBucket.ResourceAssets] = bucket;
    disposeBucket = dispose;
  });

  afterEach(async () => {
    await deleteDirectory(getBucket(StorageBucket.ResourceAssets));
    await mockContext.db.delete(resourcesInResource);
  });

  afterAll(async () => {
    await disposeBucket?.();
  });

  return { getCaller: () => caller, getMockContext: () => mockContext };
};

describe.todo("setupResourceSuite");
