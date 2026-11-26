import type { TRPCRouter } from "#server/trpc/routers/index";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { setupMockStorageBucket } from "#server/services/storage/setupMockStorageBucket.test";
import { createMockContext } from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { clickerRouter } from "#server/trpc/routers/clicker";
import { ClickerSave } from "#shared/models/clicker/data/ClickerSave";
import { deleteDirectory } from "@esposter/db";
import { StorageBucket } from "@esposter/db-schema";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

// The save's behaviour matrix lives in blobState.test.ts; here only the wiring to the player's bucket
describe("clickerRouter", () => {
  let caller: DecorateRouterRecord<TRPCRouter["clicker"]>;
  const { getMockBucket } = setupMockStorageBucket(StorageBucket.ClickerAssets);

  beforeAll(async () => {
    const mockContext = await createMockContext();
    caller = createCallerFactory(clickerRouter)(mockContext);
  });

  afterEach(async () => {
    await deleteDirectory(getMockBucket());
    vi.restoreAllMocks();
  });

  test("saves and reads", async () => {
    expect.hasAssertions();

    const clickerSave = new ClickerSave();
    await caller.saveClicker({ data: clickerSave });
    const { data: storedClickerSave } = await caller.readClicker();

    expect(storedClickerSave).toStrictEqual(clickerSave);
  });
});
