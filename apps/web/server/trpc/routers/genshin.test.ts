import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { useContainerClient } from "#server/composables/azure/container/useContainerClient";
import { getSaveBlobName } from "#server/services/blobState/getSaveBlobName";
import { createCallerFactory } from "#server/trpc";
import { createMockContext, getMockSession } from "#server/trpc/context.test";
import { genshinRouter } from "#server/trpc/routers/genshin";
import { readJsonBlob, writeJsonBlob } from "@esposter/db";
import { AzureContainer } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { EMPTY_GENSHIN_SAVE } from "genshin-world/save";
import { beforeAll, describe, expect, test } from "vitest";

describe("genshinRouter", () => {
  let mockContext: Context;
  let genshinCaller: DecorateRouterRecord<TRPCRouter["genshin"]>;

  beforeAll(async () => {
    mockContext = await createMockContext();
    genshinCaller = createCallerFactory(genshinRouter)(mockContext);
  });

  test("a second start replaces the first session, which its next save is refused for", async () => {
    expect.hasAssertions();

    const firstStart = await genshinCaller.startGenshin();
    const secondStart = await genshinCaller.startGenshin();

    expect(secondStart.save).toStrictEqual(EMPTY_GENSHIN_SAVE);
    expect(secondStart.sessionId).not.toBe(firstStart.sessionId);
    await expect(
      genshinCaller.saveGenshin({ save: EMPTY_GENSHIN_SAVE, sessionId: firstStart.sessionId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: The game was started in another session]`);
  });

  test("the current session's save is accepted", async () => {
    expect.hasAssertions();

    const { sessionId } = await genshinCaller.startGenshin();
    const result = await genshinCaller.saveGenshin({ save: EMPTY_GENSHIN_SAVE, sessionId });

    expect(result.serverNow).toBeTypeOf("string");
  });

  test("a start over a save that does not parse is refused and leaves the save as it was", async () => {
    expect.hasAssertions();

    const containerClient = await useContainerClient(AzureContainer.GenshinAssets);
    const blobName = getSaveBlobName(getMockSession().user.id);
    const storedText = "not a save";
    await writeJsonBlob(containerClient, blobName, storedText);

    await expect(genshinCaller.startGenshin()).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Read, blobName, "✖ Invalid input: expected object, received undefined").message}]`,
    );
    expect((await readJsonBlob(containerClient, blobName))?.toString()).toBe(storedText);
  });
});
