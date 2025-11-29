import type { TRPCRouter } from "@@/server/trpc/routers";
import type { UserAchievementWithRelations } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { AchievementDefinitionMap } from "#shared/services/achievement/achievementDefinitions";
import { achievementEventEmitter } from "@@/server/services/achievement/events/achievementEventEmitter";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession } from "@@/server/trpc/context.test";
import { achievementRouter } from "@@/server/trpc/routers/achievement";
import { AchievementName } from "@esposter/db-schema";
import { assert, beforeAll, describe, expect, test } from "vitest";

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

  test("on updates", async () => {
    expect.hasAssertions();

    const createdAt = new Date();
    const mockAchievement: UserAchievementWithRelations = {
      achievement: {
        createdAt,
        deletedAt: null,
        id: crypto.randomUUID(),
        name: AchievementName.CenturyClub,
        updatedAt: createdAt,
      },
      achievementId: crypto.randomUUID(),
      amount: 1,
      createdAt,
      deletedAt: null,
      id: crypto.randomUUID(),
      unlockedAt: new Date(),
      updatedAt: createdAt,
      userId: getMockSession().user.id,
    };
    const onUpdateAchievement = await caller.onUpdateAchievement();
    const [data] = await Promise.all([
      onUpdateAchievement[Symbol.asyncIterator]().next(),
      Promise.resolve(achievementEventEmitter.emit("updateAchievement", mockAchievement)),
    ]);

    assert(!data.done);

    expect(data.value).toStrictEqual(mockAchievement);
  });
});
