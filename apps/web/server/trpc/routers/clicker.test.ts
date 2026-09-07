import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { ClickerSave } from "#shared/models/clicker/data/ClickerSave";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { clickerRouter } from "@@/server/trpc/routers/clicker";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

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
});
