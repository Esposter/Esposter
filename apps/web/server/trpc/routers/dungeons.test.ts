import type { TRPCRouter } from "#server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "#server/trpc";
import { createMockContext } from "#server/trpc/context.test";
import { dungeonsRouter } from "#server/trpc/routers/dungeons";
import { Dungeons } from "#shared/models/dungeons/data/Dungeons";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("dungeonsRouter", () => {
  let caller: DecorateRouterRecord<TRPCRouter["dungeons"]>;

  beforeAll(async () => {
    const mockContext = await createMockContext();
    caller = createCallerFactory(dungeonsRouter)(mockContext);
  });

  afterEach(() => {
    MockContainerDatabase.clear();
  });

  test("saves and reads", async () => {
    expect.hasAssertions();

    const dungeons = new Dungeons();
    await caller.saveDungeons(dungeons);
    const storedDungeons = await caller.readDungeons();

    expect(storedDungeons).toStrictEqual(dungeons);
  });
});
