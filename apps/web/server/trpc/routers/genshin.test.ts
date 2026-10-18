import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { authMocks } from "#server/auth.test";
import { useContainerClient } from "#server/composables/azure/container/useContainerClient";
import { getAccountCharacterPackStagingBlobName } from "#server/services/genshin/accountCharacterPack/getAccountCharacterPackStagingBlobName";
import { readAccountCharacterPackFile } from "#server/services/genshin/accountCharacterPack/readAccountCharacterPackFile";
import { createCallerFactory } from "#server/trpc";
import { createMockContext } from "#server/trpc/context.test";
import { genshinRouter } from "#server/trpc/routers/genshin";
import { AzureContainer, storageLedgerInStorage } from "@esposter/db-schema";
import { MockContainerDatabase } from "azure-mock";
import { eq } from "drizzle-orm";
import { EMPTY_GENSHIN_SAVE } from "genshin-world/save";
import { createHash } from "node:crypto";
import { zstdCompressSync } from "node:zlib";
import { afterEach, assert, beforeAll, describe, expect, test } from "vitest";

describe("genshinRouter", () => {
  let mockContext: Context;
  let genshinCaller: DecorateRouterRecord<TRPCRouter["genshin"]>;
  const firstSessionId = crypto.randomUUID();
  const secondSessionId = crypto.randomUUID();

  beforeAll(async () => {
    mockContext = await createMockContext();
    genshinCaller = createCallerFactory(genshinRouter)(mockContext);
  });

  afterEach(() => {
    MockContainerDatabase.clear();
  });

  test("a second start replaces the first session, which its next save is refused for", async () => {
    expect.hasAssertions();

    const firstStart = await genshinCaller.startGenshin({ sessionId: firstSessionId });
    const secondStart = await genshinCaller.startGenshin({ sessionId: secondSessionId });
    assert.exists(firstStart.etag);

    expect(secondStart.save).toStrictEqual(EMPTY_GENSHIN_SAVE);
    expect(secondStart.sessionId).toBe(secondSessionId);
    await expect(
      genshinCaller.saveGenshin({ etag: firstStart.etag, save: EMPTY_GENSHIN_SAVE, sessionId: firstSessionId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: The game was started in another session]`);
  });

  test("a start answers the session it replaced and the ETag its own write minted", async () => {
    expect.hasAssertions();

    const firstStart = await genshinCaller.startGenshin({ sessionId: firstSessionId });
    const secondStart = await genshinCaller.startGenshin({ sessionId: secondSessionId });

    expect([secondStart.isNew, secondStart.previousSessionId]).toStrictEqual([false, firstSessionId]);
    expect(secondStart.etag).toBeTypeOf("string");
    expect(secondStart.etag).not.toBe(firstStart.etag);
  });

  // A page whose start's write landed before its response was lost sends the same session again, and is answered the
  // Start it already took rather than one that would read as a replacement of its own
  test("a start retried after its write landed answers the start it took, and writes nothing", async () => {
    expect.hasAssertions();

    const firstStart = await genshinCaller.startGenshin({ sessionId: firstSessionId });
    const retriedStart = await genshinCaller.startGenshin({ sessionId: firstSessionId });

    expect([retriedStart.isNew, retriedStart.previousSessionId, retriedStart.sessionId]).toStrictEqual([
      true,
      undefined,
      firstSessionId,
    ]);
    expect(retriedStart.etag).toBe(firstStart.etag);
  });

  test("a start retried after it replaced a session answers the replacement it made", async () => {
    expect.hasAssertions();

    await genshinCaller.startGenshin({ sessionId: firstSessionId });
    const replacingStart = await genshinCaller.startGenshin({ sessionId: secondSessionId });
    const retriedStart = await genshinCaller.startGenshin({ sessionId: secondSessionId });

    expect([retriedStart.isNew, retriedStart.previousSessionId]).toStrictEqual([false, firstSessionId]);
    expect(retriedStart.etag).toBe(replacingStart.etag);
  });

  test("the current session's save is accepted under the ETag its start returned", async () => {
    expect.hasAssertions();

    const start = await genshinCaller.startGenshin({ sessionId: firstSessionId });
    assert.exists(start.etag);
    const result = await genshinCaller.saveGenshin({
      etag: start.etag,
      save: EMPTY_GENSHIN_SAVE,
      sessionId: start.sessionId,
    });

    expect(result.serverNow).toBeTypeOf("string");
  });

  // A save whose response was lost is sent again under the ETag it was first sent with, which that save has replaced
  test("a save retried under an ETag its own session's earlier save replaced is written again", async () => {
    expect.hasAssertions();

    const start = await genshinCaller.startGenshin({ sessionId: firstSessionId });
    assert.exists(start.etag);
    const landed = await genshinCaller.saveGenshin({
      etag: start.etag,
      save: EMPTY_GENSHIN_SAVE,
      sessionId: start.sessionId,
    });
    const retried = await genshinCaller.saveGenshin({
      etag: start.etag,
      save: EMPTY_GENSHIN_SAVE,
      sessionId: start.sessionId,
    });

    expect(retried.etag).toBeTypeOf("string");
    expect(retried.etag).not.toBe(landed.etag);
  });

  // The blob is the player's only copy, so a start over one that no longer parses would be the loss, and a save is
  // Refused the same way
  test("a stored save that no longer parses is neither started over nor overwritten", async () => {
    expect.hasAssertions();

    const start = await genshinCaller.startGenshin({ sessionId: firstSessionId });
    const container = MockContainerDatabase.get(AzureContainer.GenshinAssets);
    assert.exists(container);
    const [blobName] = container.keys();
    assert.exists(blobName);
    const unparsableBlob = zstdCompressSync(JSON.stringify({ save: {}, sessionId: start.sessionId }));
    container.set(blobName, unparsableBlob);

    await expect(genshinCaller.startGenshin({ sessionId: secondSessionId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: The saved game could not be read]`,
    );
    expect(container.get(blobName)).toBe(unparsableBlob);
  });
});

describe("genshinRouter character packs", () => {
  let mockContext: Context;
  let genshinCaller: DecorateRouterRecord<TRPCRouter["genshin"]>;
  const characterId = 1;
  const bytes = new TextEncoder().encode("model");
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const keepId = crypto.randomUUID();
  const stagingBlobName = getAccountCharacterPackStagingBlobName(authMocks.user.id, keepId, sha256);

  beforeAll(async () => {
    mockContext = await createMockContext();
    genshinCaller = createCallerFactory(genshinRouter)(mockContext);
  });

  afterEach(async () => {
    MockContainerDatabase.clear();
    await mockContext.db.delete(storageLedgerInStorage);
  });

  test("grants each file's upload against the player's quota for its declared size", async () => {
    expect.hasAssertions();

    const sasUrls = await genshinCaller.generateCharacterPackUploadSasUrls({
      files: [{ sha256, size: bytes.length }],
      keepId,
    });

    expect(sasUrls).toHaveLength(1);
    await expect(
      mockContext.db
        .select({ blobName: storageLedgerInStorage.blobName, declaredBytes: storageLedgerInStorage.declaredBytes })
        .from(storageLedgerInStorage)
        .where(eq(storageLedgerInStorage.blobName, stagingBlobName)),
    ).resolves.toStrictEqual([{ blobName: stagingBlobName, declaredBytes: bytes.length }]);
  });

  test("refuses a pack whose staged file differs in size from the one it declares, and deletes the staged file", async () => {
    expect.hasAssertions();

    const containerClient = await useContainerClient(AzureContainer.GenshinAssets);
    await containerClient.getBlockBlobClient(stagingBlobName).upload(bytes, bytes.length);

    await expect(
      genshinCaller.keepCharacterPack({
        characterId,
        files: [{ path: "model.pmx", sha256, size: bytes.length + 1 }],
        keepId,
        modelName: "a",
        packHash: sha256,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Create, name: 1, holds a file not uploaded as 9372c470eeadd5ecd9c3c74c2b3cb633f8e2f2fad799250a0f70d652b6b825e4]`,
    );
    expect(MockContainerDatabase.get(AzureContainer.GenshinAssets)?.has(stagingBlobName)).toBe(false);
    await expect(genshinCaller.readCharacterPacks()).resolves.toStrictEqual([]);
  });

  test("lists a pack once its files are uploaded under their hashes, and no longer once it is removed", async () => {
    expect.hasAssertions();

    const containerClient = await useContainerClient(AzureContainer.GenshinAssets);
    const userId = authMocks.user.id;
    await containerClient
      .getBlockBlobClient(getAccountCharacterPackStagingBlobName(userId, keepId, sha256))
      .upload(bytes, bytes.length);
    await genshinCaller.keepCharacterPack({
      characterId,
      files: [{ path: "model.pmx", sha256, size: bytes.length }],
      keepId,
      modelName: "a",
      packHash: sha256,
    });

    await expect(genshinCaller.readCharacterPacks()).resolves.toStrictEqual([
      { characterId, files: [{ path: "model.pmx", sha256, size: bytes.length }], modelName: "a", packHash: sha256 },
    ]);
    await expect(readAccountCharacterPackFile(userId, sha256)).resolves.toStrictEqual(Buffer.from(bytes));
    await genshinCaller.removeCharacterPack({ characterId });
    await expect(genshinCaller.readCharacterPacks()).resolves.toStrictEqual([]);
    await expect(readAccountCharacterPackFile(userId, sha256)).resolves.toBeUndefined();
  });

  test("two keeps that carry a file of the same hash both keep their packs", async () => {
    expect.hasAssertions();

    const containerClient = await useContainerClient(AzureContainer.GenshinAssets);
    const userId = authMocks.user.id;
    const otherKeepId = crypto.randomUUID();
    const files = [{ path: "model.pmx", sha256, size: bytes.length }];
    await Promise.all(
      [keepId, otherKeepId].map((id) =>
        containerClient
          .getBlockBlobClient(getAccountCharacterPackStagingBlobName(userId, id, sha256))
          .upload(bytes, bytes.length),
      ),
    );
    await genshinCaller.keepCharacterPack({ characterId, files, keepId, modelName: "a", packHash: sha256 });
    await genshinCaller.keepCharacterPack({
      characterId: characterId + 1,
      files,
      keepId: otherKeepId,
      modelName: "b",
      packHash: sha256,
    });

    await expect(genshinCaller.readCharacterPacks()).resolves.toStrictEqual([
      { characterId, files, modelName: "a", packHash: sha256 },
      { characterId: characterId + 1, files, modelName: "b", packHash: sha256 },
    ]);
  });

  test("refuses a pack whose uploaded file does not hash to the name it was uploaded under", async () => {
    expect.hasAssertions();

    const containerClient = await useContainerClient(AzureContainer.GenshinAssets);
    const userId = authMocks.user.id;
    await containerClient
      .getBlockBlobClient(getAccountCharacterPackStagingBlobName(userId, keepId, sha256))
      .upload(new TextEncoder().encode("other"), 5);

    await expect(
      genshinCaller.keepCharacterPack({
        characterId,
        files: [{ path: "model.pmx", sha256, size: 5 }],
        keepId,
        modelName: "a",
        packHash: sha256,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Create, name: 1, holds a file not uploaded as 9372c470eeadd5ecd9c3c74c2b3cb633f8e2f2fad799250a0f70d652b6b825e4]`,
    );
    await expect(genshinCaller.readCharacterPacks()).resolves.toStrictEqual([]);
  });
});
