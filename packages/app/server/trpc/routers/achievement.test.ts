import type { AchievementEvents } from "@@/server/services/achievement/events/achievementEventEmitter";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { AchievementDefinitionMap } from "#shared/services/achievement/achievementDefinitions";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession } from "@@/server/trpc/context.test";
import { trpcRouter } from "@@/server/trpc/routers";
import { achievements, UserAchievementRelations, WebpageAchievementName } from "@esposter/db-schema";
import { afterEach, assert, beforeAll, describe, expect, test } from "vitest";

describe("achievement", () => {
  let caller: DecorateRouterRecord<TRPCRouter["_def"]["procedures"]>;
  let mockContext: Awaited<ReturnType<typeof createMockContext>>;
  const updatedAchievements = [WebpageAchievementName.WebDeveloper];

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

    const onUpdateAchievement = await caller.achievement.onUpdateAchievement();
    const [data] = await Promise.all([
      onUpdateAchievement[Symbol.asyncIterator]().next(),
      caller.webpageEditor.saveWebpageEditor(new WebpageEditor()),
    ]);

    const unlockedAchievements: AchievementEvents["updateAchievement"][number] = [];

    assert(!data.done);

    expect(data.value).toHaveLength(updatedAchievements.length);

    for (const achievement of data.value) {
      expect(updatedAchievements).toContain(achievement.achievement.name);

      if (achievement.unlockedAt) unlockedAchievements.push(achievement);
    }

    expect(unlockedAchievements).toHaveLength(1);
    expect(unlockedAchievements[0].achievement.name).toBe(WebpageAchievementName.WebDeveloper);
    expect(unlockedAchievements[0].amount).toBe(1);
    expect(unlockedAchievements[0].unlockedAt).toBeInstanceOf(Date);

    const userAchievement = await mockContext.db.query.userAchievements.findFirst({
      where: (userAchievements, { and, eq }) =>
        and(
          eq(userAchievements.achievementId, unlockedAchievements[0].achievementId),
          eq(userAchievements.userId, getMockSession().user.id),
        ),
      with: UserAchievementRelations,
    });
    assert(userAchievement);

    expect(userAchievement).toStrictEqual(unlockedAchievements[0]);
  });
});
