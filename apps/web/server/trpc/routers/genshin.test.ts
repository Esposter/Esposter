import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers/index";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { setupMockStorageBucket } from "#server/services/storage/setupMockStorageBucket.test";
import { createMockContext } from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { genshinRouter } from "#server/trpc/routers/genshin";
import { deleteDirectory, listBlobNames } from "@esposter/db";
import { StorageBucket } from "@esposter/db-schema";
import { createStartingGenshinSave, EMPTY_GENSHIN_SAVE, getResinParamPath } from "genshin-world/save";
import { zstdCompressSync } from "node:zlib";
import { v7 } from "uuid";
import { afterEach, assert, beforeAll, describe, expect, test, vi } from "vitest";

describe("genshinRouter", () => {
  let mockContext: Context;
  let genshinCaller: DecorateRouterRecord<TRPCRouter["genshin"]>;
  const { getMockBucket } = setupMockStorageBucket(StorageBucket.GenshinAssets);
  const { getMockBucket: getPublicHostedAssets } = setupMockStorageBucket(StorageBucket.PublicHostedAssets);
  // The game's record the new player's save starts from, stored in the shared hosted bucket it is published to
  const resinRecord = {
    originalResinCap: 123,
    originalResinRefillCap: 2000,
    originalResinRegenMinutes: 8,
    primogemResinRefillPrices: [50],
    primogemResinRestore: 60,
  };
  const startingSave = createStartingGenshinSave(resinRecord);
  const firstSessionId = v7();
  const secondSessionId = v7();

  beforeAll(async () => {
    await getPublicHostedAssets().put(getResinParamPath(), zstdCompressSync(JSON.stringify(resinRecord)));
    mockContext = await createMockContext();
    genshinCaller = createCallerFactory(genshinRouter)(mockContext);
  });

  afterEach(async () => {
    vi.useRealTimers();
    await deleteDirectory(getMockBucket());
  });

  test("a second start replaces the first session, which its next save is refused for", async () => {
    expect.hasAssertions();

    const firstStart = await genshinCaller.startGenshin({ sessionId: firstSessionId });
    const secondStart = await genshinCaller.startGenshin({ sessionId: secondSessionId });
    assert.exists(firstStart.etag);

    expect(secondStart.save).toStrictEqual(startingSave);
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

    vi.useFakeTimers({ now: 0, toFake: ["Date", "Temporal"] });
    const start = await genshinCaller.startGenshin({ sessionId: firstSessionId });
    assert.exists(start.etag);
    const result = await genshinCaller.saveGenshin({
      etag: start.etag,
      save: EMPTY_GENSHIN_SAVE,
      sessionId: start.sessionId,
    });

    expect(result.serverNow).toBe("1970-01-01T00:00:00Z");
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

    // The retry is refused under the replaced ETag and written again under the current one. R2's ETag is the content's
    // Hash, so writing the same save reads back the ETag it landed with
    expect(retried.etag).toBeTypeOf("string");
    expect(retried.etag).toBe(landed.etag);
  });

  // The blob is the player's only copy, so a start over one that no longer parses would be the loss, and a save is
  // Refused the same way
  test("a stored save that no longer parses is neither started over nor overwritten", async () => {
    expect.hasAssertions();

    const start = await genshinCaller.startGenshin({ sessionId: firstSessionId });
    const [blobName] = await listBlobNames(getMockBucket(), "");
    assert.exists(blobName);
    const unparsableBlob = zstdCompressSync(JSON.stringify({ save: {}, sessionId: start.sessionId }));
    await getMockBucket().put(blobName, unparsableBlob);

    await expect(genshinCaller.startGenshin({ sessionId: secondSessionId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: The saved game could not be read]`,
    );
    const storedBlob = await getMockBucket().get(blobName);
    assert.exists(storedBlob);
    expect(Buffer.from(await storedBlob.arrayBuffer())).toStrictEqual(unparsableBlob);
  });
});
