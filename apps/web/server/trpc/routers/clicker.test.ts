import type { TRPCRouter } from "#server/trpc/routers/index";
import type { R2Bucket } from "@cloudflare/workers-types";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { mockBuckets } from "#server/services/storage/getBucket.test";
import { createMockContext } from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { clickerRouter } from "#server/trpc/routers/clicker";
import { ClickerSave } from "#shared/models/clicker/data/ClickerSave";
import { deleteDirectory } from "@esposter/db";
import { createMockBucket } from "@esposter/db-mock";
import { StorageBucket } from "@esposter/db-schema";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

// The save's behaviour matrix lives in blobState.test.ts; here only the wiring to the player's bucket
describe("clickerRouter", () => {
  let caller: DecorateRouterRecord<TRPCRouter["clicker"]>;
  let bucket: R2Bucket;
  let dispose: () => Promise<void>;

  beforeAll(async () => {
    ({ bucket, dispose } = await createMockBucket(StorageBucket.ClickerAssets));
    mockBuckets[StorageBucket.ClickerAssets] = bucket;
    const mockContext = await createMockContext();
    caller = createCallerFactory(clickerRouter)(mockContext);
  });

  afterEach(async () => {
    await deleteDirectory(bucket);
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await dispose();
  });

  test("saves and reads", async () => {
    expect.hasAssertions();

    const clickerSave = new ClickerSave();
    await caller.saveClicker({ data: clickerSave });
    const { data: storedClickerSave } = await caller.readClicker();

    expect(storedClickerSave).toStrictEqual(clickerSave);
  });
});
