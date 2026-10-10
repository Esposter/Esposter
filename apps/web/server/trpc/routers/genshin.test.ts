import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "#server/trpc";
import { createMockContext } from "#server/trpc/context.test";
import { genshinRouter } from "#server/trpc/routers/genshin";
import { AzureContainer } from "@esposter/db-schema";
import { MockContainerDatabase } from "azure-mock";
import { EMPTY_GENSHIN_SAVE } from "genshin-world/save";
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
