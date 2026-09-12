import type { Context } from "@@/server/trpc/context";
import type { DecorateRouterRecord, RouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { resources } from "@esposter/db-schema";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe } from "vitest";

// Resource-suite fixture: owns the mock context, the caller for the resource-typed router under test, and the
// Cleanup every resource suite owes — the content container and the resource rows. Suite-specific hooks compose —
// Before-hooks run after these, after-hooks before — so a suite that also writes tables or queues clears those itself.
export const setupResourceSuite = <TRecord extends RouterRecord>(
  resourceRouter: Parameters<typeof createCallerFactory<TRecord>>[0],
) => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRecord>;

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(resourceRouter)(mockContext);
  });

  afterEach(async () => {
    MockContainerDatabase.clear();
    await mockContext.db.delete(resources);
  });

  return { getCaller: () => caller, getMockContext: () => mockContext };
};

describe.todo("setupResourceSuite");
