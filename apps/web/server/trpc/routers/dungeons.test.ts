import type { TRPCRouter } from "#server/trpc/routers/index";
import type { R2Bucket } from "@cloudflare/workers-types";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { mockBuckets } from "#server/services/storage/getBucket.test";
import { createMockContext } from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { dungeonsRouter } from "#server/trpc/routers/dungeons";
import { Dungeons } from "#shared/models/dungeons/data/Dungeons";
import { deleteDirectory } from "@esposter/db";
import { createMockBucket } from "@esposter/db-mock";
import { StorageBucket } from "@esposter/db-schema";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

// The save's behaviour matrix lives in blobState.test.ts; here only the wiring to the user's bucket
describe("dungeonsRouter", () => {
  let caller: DecorateRouterRecord<TRPCRouter["dungeons"]>;
  let bucket: R2Bucket;
  let dispose: () => Promise<void>;

  beforeAll(async () => {
    ({ bucket, dispose } = await createMockBucket(StorageBucket.UserAssets));
    mockBuckets[StorageBucket.UserAssets] = bucket;
    const mockContext = await createMockContext();
    caller = createCallerFactory(dungeonsRouter)(mockContext);
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

    const dungeons = new Dungeons();
    await caller.saveDungeons({ data: dungeons });
    const { data: storedDungeons } = await caller.readDungeons();

    expect(storedDungeons).toStrictEqual(dungeons);
  });
});
