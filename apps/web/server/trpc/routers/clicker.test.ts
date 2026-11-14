import type { TRPCRouter } from "#server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "#server/trpc";
import { createMockContext } from "#server/trpc/context.test";
import { clickerRouter } from "#server/trpc/routers/clicker";
import { ClickerSave } from "#shared/models/clicker/data/ClickerSave";
import { compressZstd } from "@esposter/db";
import { StorageBucket } from "@esposter/db-schema";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, assert, beforeAll, describe, expect, test, vi } from "vitest";

describe("clickerRouter", () => {
  let caller: DecorateRouterRecord<TRPCRouter["clicker"]>;

  beforeAll(async () => {
    const mockContext = await createMockContext();
    caller = createCallerFactory(clickerRouter)(mockContext);
  });

  afterEach(() => {
    MockContainerDatabase.clear();
    vi.restoreAllMocks();
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
    const container = MockContainerDatabase.get(StorageBucket.ClickerAssets);
    assert.exists(container);
    const [blobName] = container.keys();
    assert.exists(blobName);
    container.set(blobName, Buffer.from(" "));

    await expect(caller.readClicker()).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Unknown frame descriptor]`,
    );
  });

  // The server's copy is the player's only one, so a save it cannot parse is refused and left as it is
  test("refuses a read of a save that no longer parses, and leaves the save as it is", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(() => {});
    await caller.saveClicker({ data: new ClickerSave() });
    const container = MockContainerDatabase.get(StorageBucket.ClickerAssets);
    assert.exists(container);
    const [blobName] = container.keys();
    assert.exists(blobName);
    const unparseableBlob = await compressZstd(JSON.stringify({ pointCount: "many" }));
    container.set(blobName, unparseableBlob);

    await expect(caller.readClicker()).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: The saved game could not be read]`,
    );
    expect(container.get(blobName)).toStrictEqual(unparseableBlob);
  });
});
