import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { ClickerSave } from "#shared/models/clicker/data/ClickerSave";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { clickerRouter } from "@@/server/trpc/routers/clicker";
import { AzureContainer } from "@esposter/db-schema";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, assert, beforeAll, describe, expect, test } from "vitest";

describe("clickerRouter", () => {
  let caller: DecorateRouterRecord<TRPCRouter["clicker"]>;

  beforeAll(async () => {
    const mockContext = await createMockContext();
    caller = createCallerFactory(clickerRouter)(mockContext);
  });

  afterEach(() => {
    MockContainerDatabase.clear();
  });

  test("saves and reads", async () => {
    expect.hasAssertions();

    const clickerSave = new ClickerSave();
    await caller.saveClicker(clickerSave);
    const storedClickerSave = await caller.readClicker();

    expect(storedClickerSave).toStrictEqual(clickerSave);
  });

  // Answered with a fresh game, a failed read would have the client's next autosave overwrite the save it missed
  test("fails a read of a save it cannot decode rather than answering with a fresh game", async () => {
    expect.hasAssertions();

    await caller.saveClicker(new ClickerSave());
    const container = MockContainerDatabase.get(AzureContainer.ClickerAssets);
    assert.exists(container);
    const [blobName] = container.keys();
    assert.exists(blobName);
    container.set(blobName, Buffer.from(" "));

    await expect(caller.readClicker()).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Unknown frame descriptor]`,
    );
  });
});
