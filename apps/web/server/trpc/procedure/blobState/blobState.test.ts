import { getMockPublishedTopics, MockPublishedTopics } from "#server/services/realtime/publishTopics.test";
import { setupMockStorageBucket } from "#server/services/storage/setupMockStorageBucket.test";
import { createMockContext, getMockSession } from "#server/trpc/context.test";
import { createCallerFactory, router } from "#server/trpc/index";
import { createReadBlobStateProcedure } from "#server/trpc/procedure/blobState/createReadBlobStateProcedure";
import { createSaveBlobStateProcedure } from "#server/trpc/procedure/blobState/createSaveBlobStateProcedure";
import { readTopicsHeader } from "#shared/services/realtime/readTopicsHeader";
import { compressZstd, deleteDirectory, listBlobNames } from "@esposter/db";
import { getBlobTopic, getSaveBlobName, getStorageBucketBindingName, StorageBucket } from "@esposter/db-schema";
import { afterEach, assert, beforeEach, describe, expect, test, vi } from "vitest";
import { z } from "zod";

class Save {
  value: number;

  constructor(init?: { value: number }) {
    this.value = init?.value ?? 0;
  }
}

// The save blob's topic, which a read of the save names and a save of it publishes
const getSaveTopic = () =>
  getBlobTopic(getStorageBucketBindingName(StorageBucket.UserAssets), getSaveBlobName(getMockSession().user.id));

describe("blob state procedures", () => {
  const saveSchema = z.object({ value: z.number() });
  const blobStateRouter = router({
    readSave: createReadBlobStateProcedure(StorageBucket.UserAssets, Save, saveSchema),
    saveSave: createSaveBlobStateProcedure(
      StorageBucket.UserAssets,
      z.object({ data: saveSchema, etag: z.string().optional() }),
    ),
  });
  const getCaller = async () => createCallerFactory(blobStateRouter)(await createMockContext());
  const { getMockBucket } = setupMockStorageBucket(StorageBucket.UserAssets);

  beforeEach(() => {
    MockPublishedTopics.length = 0;
  });

  afterEach(async () => {
    await deleteDirectory(getMockBucket());
    vi.restoreAllMocks();
  });

  // A read's topics travel back with its answer, so the save it reads is named by its blob, which a save publishes
  test("a read of a save names the blob it reads in its topics", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    await createCallerFactory(blobStateRouter)(context).readSave();

    expect(
      readTopicsHeader(context.responseHeaders, "readSave").flatMap(({ topics }) => topics.map(({ topic }) => topic)),
    ).toContain(getSaveTopic());
  });

  test("a save publishes the blob it writes", async () => {
    expect.hasAssertions();

    await (await getCaller()).saveSave({ data: { value: 0 } });

    expect(getMockPublishedTopics()).toContain(getSaveTopic());
  });

  // With no save held, a read answers a fresh one under no ETag, which the next save then creates
  test("answers a fresh save, under no ETag, for a player with no save", async () => {
    expect.hasAssertions();

    const caller = await getCaller();
    const { data, etag } = await caller.readSave();

    expect(data).toStrictEqual(new Save());
    expect(etag).toBeUndefined();
  });

  test("refuses a save sent under an etag another save has replaced", async () => {
    expect.hasAssertions();

    const caller = await getCaller();
    const { etag: firstEtag } = await caller.saveSave({ data: { value: 0 } });
    await caller.saveSave({ data: { value: 1 }, etag: firstEtag });

    await expect(caller.saveSave({ data: { value: 1 }, etag: firstEtag })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: The save changed since it was read]`,
    );
  });

  test("refuses a save that would create a save another session already created", async () => {
    expect.hasAssertions();

    const caller = await getCaller();
    await caller.saveSave({ data: { value: 0 } });

    await expect(caller.saveSave({ data: { value: 0 } })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: The save changed since it was read]`,
    );
  });

  // Answered with a fresh save, a failed read would have the client's next autosave overwrite the save it missed
  test("fails a read of a save it cannot decode rather than answering with a fresh save", async () => {
    expect.hasAssertions();

    const caller = await getCaller();
    await caller.saveSave({ data: { value: 0 } });
    const [blobName] = await listBlobNames(getMockBucket(), "");
    assert.exists(blobName);
    await getMockBucket().put(blobName, Buffer.from(" "));

    await expect(caller.readSave()).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: Unknown frame descriptor]`);
  });

  // The server's copy is the player's only one, so a save it cannot parse is refused and left as it is
  test("refuses a read of a save that no longer parses, and leaves the save as it is", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(() => {});
    const caller = await getCaller();
    await caller.saveSave({ data: { value: 0 } });
    const [blobName] = await listBlobNames(getMockBucket(), "");
    assert.exists(blobName);
    const unparseableBlob = await compressZstd(JSON.stringify({ value: "many" }));
    await getMockBucket().put(blobName, unparseableBlob);

    await expect(caller.readSave()).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: The saved game could not be read]`,
    );
    const storedBlob = await getMockBucket().get(blobName);
    assert.exists(storedBlob);
    expect(Buffer.from(await storedBlob.arrayBuffer())).toStrictEqual(unparseableBlob);
  });
});
