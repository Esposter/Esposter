import type { Context } from "#server/trpc/context";
import type { DecorateRouterRecord, RouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { setupMockStorageBucket } from "#server/services/storage/setupMockStorageBucket.test";
import { createMockContext } from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { deleteDirectory } from "@esposter/db";
import { resourcesInResource, StorageBucket } from "@esposter/db-schema";
import { afterEach, beforeAll, describe } from "vitest";

// Resource-suite fixture: owns the mock context, the caller for the resource-typed router under test, and the
// Cleanup every resource suite owes — the content bucket and the resource rows. Suite-specific hooks compose —
// Before-hooks run after these, after-hooks before — so a suite that also writes tables or queues clears those itself.
export const setupResourceSuite = <TRecord extends RouterRecord>(
  resourceRouter: Parameters<typeof createCallerFactory<TRecord>>[0],
) => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRecord>;
  const { getMockBucket } = setupMockStorageBucket(StorageBucket.ResourceAssets);

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(resourceRouter)(mockContext);
  });

  afterEach(async () => {
    await deleteDirectory(getMockBucket());
    await mockContext.db.delete(resourcesInResource);
  });

  return { getCaller: () => caller, getMockBucket, getMockContext: () => mockContext };
};

describe.todo("setupResourceSuite");
