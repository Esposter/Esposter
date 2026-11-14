import type { TRPCRouter } from "#server/trpc/routers";
import type { R2Bucket } from "@cloudflare/workers-types";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "#server/trpc";
import { createMockContext } from "#server/trpc/context.test";
import { clickerRouter } from "#server/trpc/routers/clicker";
import { ClickerSave } from "#shared/models/clicker/data/ClickerSave";
import { compressZstd, deleteDirectory, listBlobNames } from "@esposter/db";
import { createMockBucket } from "@esposter/db-mock";
import { StorageBucket } from "@esposter/db-schema";
import { afterAll, afterEach, assert, beforeAll, describe, expect, test, vi } from "vitest";

const { buckets } = vi.hoisted(() => ({ buckets: {} as Record<StorageBucket, R2Bucket> }));

vi.mock(import("#server/services/storage/getBucket"), () => ({
  getBucket: (storageBucket: StorageBucket) => buckets[storageBucket],
}));

describe("clickerRouter", () => {
  let caller: DecorateRouterRecord<TRPCRouter["clicker"]>;
  let bucket: R2Bucket;
  let dispose: () => Promise<void>;

  beforeAll(async () => {
    ({ bucket, dispose } = await createMockBucket(StorageBucket.ClickerAssets));
    buckets[StorageBucket.ClickerAssets] = bucket;
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

  test("answers a fresh game, under no ETag, for a player with no save", async () => {
    expect.hasAssertions();

    const { data, etag } = await caller.readClicker();

    expect(data).toStrictEqual(new ClickerSave({ createdAt: data.createdAt, id: data.id, updatedAt: data.updatedAt }));
    expect(etag).toBeUndefined();
  });

  test("refuses a save sent under an etag another save has replaced", async () => {
    expect.hasAssertions();

    const { etag: firstEtag } = await caller.saveClicker({ data: new ClickerSave() });
    await caller.saveClicker({ data: new ClickerSave(), etag: firstEtag });

    await expect(
      caller.saveClicker({ data: new ClickerSave(), etag: firstEtag }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: The save changed since it was read]`);
  });

  test("refuses a save that would create a save another session already created", async () => {
    expect.hasAssertions();

    await caller.saveClicker({ data: new ClickerSave() });

    await expect(caller.saveClicker({ data: new ClickerSave() })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: The save changed since it was read]`,
    );
  });

  // Answered with a fresh game, a failed read would have the client's next autosave overwrite the save it missed
  test("fails a read of a save it cannot decode rather than answering with a fresh game", async () => {
    expect.hasAssertions();

    await caller.saveClicker({ data: new ClickerSave() });
    const [blobName] = await listBlobNames(bucket, "");
    assert.exists(blobName);
    await bucket.put(blobName, Buffer.from(" "));

    await expect(caller.readClicker()).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Unknown frame descriptor]`,
    );
  });

  // The server's copy is the player's only one, so a save it cannot parse is refused and left as it is
  test("refuses a read of a save that no longer parses, and leaves the save as it is", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(() => {});
    await caller.saveClicker({ data: new ClickerSave() });
    const [blobName] = await listBlobNames(bucket, "");
    assert.exists(blobName);
    const unparseableBlob = await compressZstd(JSON.stringify({ pointCount: "many" }));
    await bucket.put(blobName, unparseableBlob);

    await expect(caller.readClicker()).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: The saved game could not be read]`,
    );
    const storedBlob = await bucket.get(blobName);
    assert.exists(storedBlob);
    expect(Buffer.from(await storedBlob.arrayBuffer())).toStrictEqual(unparseableBlob);
  });
});
