import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";
import type { AchievementEvents } from "~~/server/services/achievement/events/achievementEventEmitter";

import { AchievementDefinitionMap } from "#shared/services/achievement/achievementDefinitions";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession } from "@@/server/trpc/context.test";
import { trpcRouter } from "@@/server/trpc/routers";
import { AchievementName, achievements } from "@esposter/db-schema";
import { afterEach, assert, beforeAll, describe, expect, test } from "vitest";

describe("achievement", () => {
  let caller: DecorateRouterRecord<TRPCRouter["_def"]["procedures"]>;
  let mockContext: Awaited<ReturnType<typeof createMockContext>>;
  const message = "message";
  const name = "name";
  const updatedAchievements = [
    AchievementName.CenturyClub,
    AchievementName.FirstMessage,
    AchievementName.MessageMaster,
  ];

  beforeAll(async () => {
    const createCaller = createCallerFactory(trpcRouter);
    mockContext = await createMockContext();
    caller = createCaller(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(achievements);
  });

  test("readAchievementMap", async () => {
    expect.hasAssertions();

    const result = await caller.achievement.readAchievementMap();

    expect(result).toStrictEqual(
      Object.fromEntries(
        Object.entries(AchievementDefinitionMap).map(([achievementName, achievementDefinition]) => [
          achievementName,
          {
            ...achievementDefinition,
            description: achievementDefinition.isHidden ? "???" : achievementDefinition.description,
          },
        ]),
      ),
    );
  });

  test("readUserAchievements", async () => {
    expect.hasAssertions();

    const result = await caller.achievement.readUserAchievements();

    expect(result).toStrictEqual([]);
  });

  test("on updates", async () => {
    expect.hasAssertions();

    const newRoom = await caller.room.createRoom({ name });
    await Promise.all([
      (async () => {
        const onUpdateAchievementIterator = (await caller.achievement.onUpdateAchievement())[Symbol.asyncIterator]();
        const unlockedAchievements: AchievementEvents["updateAchievement"] = [];

        for (const updatedAchievement of updatedAchievements) {
          const data = await onUpdateAchievementIterator.next();
          assert(!data.done);

          expect(data.value.achievement.name).toBe(updatedAchievement);

          if (data.value.unlockedAt) unlockedAchievements.push(data.value);
        }

        expect(unlockedAchievements).toHaveLength(1);
        expect(unlockedAchievements[0].achievement.name).toBe(AchievementName.FirstMessage);
        expect(unlockedAchievements[0].amount).toBe(1);
        expect(unlockedAchievements[0].unlockedAt).toBeInstanceOf(Date);

        const userAchievement = await mockContext.db.query.userAchievements.findFirst({
          where: (userAchievements, { and, eq }) =>
            and(
              eq(userAchievements.achievementId, unlockedAchievements[0].achievementId),
              eq(userAchievements.userId, getMockSession().user.id),
            ),
          with: { achievement: true },
        });
        assert(userAchievement);

        expect(userAchievement).toStrictEqual(unlockedAchievements[0]);
      })(),
      caller.message.createMessage({ message, roomId: newRoom.id }),
    ]);
  });
});
