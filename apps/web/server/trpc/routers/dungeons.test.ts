import type { TRPCRouter } from "#server/trpc/routers/index";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { setupMockStorageBucket } from "#server/services/storage/setupMockStorageBucket.test";
import { createMockContext } from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { dungeonsRouter } from "#server/trpc/routers/dungeons";
import { Dungeons } from "#shared/models/dungeons/data/Dungeons";
import { deleteDirectory } from "@esposter/db";
import { StorageBucket } from "@esposter/db-schema";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

// The save's behaviour matrix lives in blobState.test.ts; here only the wiring to the user's bucket
describe("dungeonsRouter", () => {
  let caller: DecorateRouterRecord<TRPCRouter["dungeons"]>;
  const { getMockBucket } = setupMockStorageBucket(StorageBucket.UserAssets);

  beforeAll(async () => {
    const mockContext = await createMockContext();
    caller = createCallerFactory(dungeonsRouter)(mockContext);
  });

  afterEach(async () => {
    await deleteDirectory(getMockBucket());
    vi.restoreAllMocks();
  });

  test("saves and reads", async () => {
    expect.hasAssertions();

    const dungeons = new Dungeons();
    await caller.saveDungeons({ data: dungeons });
    const { data: storedDungeons } = await caller.readDungeons();

    expect(storedDungeons).toStrictEqual(dungeons);
  });
});
