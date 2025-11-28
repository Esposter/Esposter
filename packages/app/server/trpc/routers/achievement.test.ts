import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { AchievementDefinitionMap } from "#shared/services/achievement/achievementDefinitions";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { achievementRouter } from "@@/server/trpc/routers/achievement";
import { beforeAll, describe, expect, test } from "vitest";

describe("achievement", () => {
  let caller: DecorateRouterRecord<TRPCRouter["achievement"]>;

  beforeAll(async () => {
    const createCaller = createCallerFactory(achievementRouter);
    const mockContext = await createMockContext();
    caller = createCaller(mockContext);
  });

  test("readAchievementMap", async () => {
    expect.hasAssertions();

    const result = await caller.readAchievementMap();

    expect(result).toStrictEqual(
      Object.fromEntries(Object.entries(AchievementDefinitionMap).filter(([, { isHidden }]) => !isHidden)),
    );
  });

  test("readAllAchievementMap", async () => {
    expect.hasAssertions();

    const result = await caller.readAllAchievementMap();

    expect(result).toBe(AchievementDefinitionMap);
  });

  test("readUserAchievements", async () => {
    expect.hasAssertions();

    const result = await caller.readUserAchievements();

    expect(result).toStrictEqual([]);
  });
});
