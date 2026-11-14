import type { TRPCRouter } from "#server/trpc/routers";
import type { R2Bucket } from "@cloudflare/workers-types";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "#server/trpc";
import { createMockContext } from "#server/trpc/context.test";
import { dungeonsRouter } from "#server/trpc/routers/dungeons";
import { Dungeons } from "#shared/models/dungeons/data/Dungeons";
import { compressZstd, deleteDirectory, listBlobNames } from "@esposter/db";
import { createMockBucket } from "@esposter/db-mock";
import { StorageBucket } from "@esposter/db-schema";
import { afterAll, afterEach, assert, beforeAll, describe, expect, test, vi } from "vitest";

const { buckets } = vi.hoisted(() => ({ buckets: {} as Record<StorageBucket, R2Bucket> }));

vi.mock(import("#server/services/storage/getBucket"), () => ({
  getBucket: (storageBucket: StorageBucket) => buckets[storageBucket],
}));

describe("dungeonsRouter", () => {
  let caller: DecorateRouterRecord<TRPCRouter["dungeons"]>;
  let bucket: R2Bucket;
  let dispose: () => Promise<void>;

  beforeAll(async () => {
    ({ bucket, dispose } = await createMockBucket(StorageBucket.UserAssets));
    buckets[StorageBucket.UserAssets] = bucket;
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

  test("refuses a save sent under an etag another save has replaced", async () => {
    expect.hasAssertions();

    const { etag: firstEtag } = await caller.saveDungeons({ data: new Dungeons() });
    await caller.saveDungeons({ data: new Dungeons(), etag: firstEtag });

    await expect(
      caller.saveDungeons({ data: new Dungeons(), etag: firstEtag }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: The save changed since it was read]`);
  });

  test("refuses a read of a save that no longer parses, and leaves the save as it is", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(() => {});
    await caller.saveDungeons({ data: new Dungeons() });
    const [blobName] = await listBlobNames(bucket, "");
    assert.exists(blobName);
    const unparseableBlob = await compressZstd(JSON.stringify({ settings: "not settings" }));
    await bucket.put(blobName, unparseableBlob);

    await expect(caller.readDungeons()).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: The saved game could not be read]`,
    );
    const storedBlob = await bucket.get(blobName);
    assert.exists(storedBlob);
    expect(Buffer.from(await storedBlob.arrayBuffer())).toStrictEqual(unparseableBlob);
  });
});
