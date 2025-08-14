import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { Dungeons } from "#shared/models/dungeons/data/Dungeons";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { dungeonsRouter } from "@@/server/trpc/routers/dungeons";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("dungeons", () => {
  let caller: DecorateRouterRecord<TRPCRouter["dungeons"]>;

  beforeAll(async () => {
    const createCaller = createCallerFactory(dungeonsRouter);
    const mockContext = await createMockContext();
    caller = createCaller(mockContext);
  });

  afterEach(() => {
    MockContainerDatabase.clear();
  });

  test("reads", async () => {
    expect.hasAssertions();

    const dungeons = await caller.readDungeons();
    const { createdAt, id, updatedAt } = dungeons;

    expect(dungeons).toStrictEqual(new Dungeons({ createdAt, id, updatedAt }));
  });

  test("saves and reads", async () => {
    expect.hasAssertions();

    const dungeons = new Dungeons();
    await caller.saveDungeons(dungeons);
    const readDungeons = await caller.readDungeons();

    expect(readDungeons).toStrictEqual(dungeons);
  });
});
