import type { AchievementEvents } from "@@/server/services/achievement/events/achievementEventEmitter";
import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { AchievementDefinitionMap } from "#shared/services/achievement/achievementDefinitions";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession } from "@@/server/trpc/context.test";
import { trpcRouter } from "@@/server/trpc/routers";
import { withAsyncIterator } from "@@/server/trpc/routers/withAsyncIterator.test";
import {
  achievements,
  SpecialAchievementName,
  UserAchievementRelations,
  WebpageAchievementName,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { afterEach, assert, beforeAll, describe, expect, test } from "vitest";

describe("achievement", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["_def"]["procedures"]>;
  const name = "name";
  const updatedAchievements = [WebpageAchievementName.WebDeveloper];

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(trpcRouter)(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(achievements);
  });

  describe("readAchievementMap", () => {
    test("when no achievements are unlocked, hidden achievements show '???'", async () => {
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

    test("when a hidden achievement is unlocked, it shows its real description", async () => {
      expect.hasAssertions();

      const room = await caller.room.createRoom({ name });
      await caller.message.createMessage({
        message: "😀😀😀😀😀😀😀😀😀😀",
        roomId: room.id,
      });
      const result = await caller.achievement.readAchievementMap();

      expect(result[SpecialAchievementName.EmojiLover].description).toBe(
        AchievementDefinitionMap[SpecialAchievementName.EmojiLover].description,
      );
    });
  });

  test("readUserAchievements", async () => {
    expect.hasAssertions();

    const result = await caller.achievement.readUserAchievements();

    expect(result).toStrictEqual([]);
  });

  test("on updates", async () => {
    expect.hasAssertions();

    const onUpdateAchievement = await caller.achievement.onUpdateAchievement();
    const data = await withAsyncIterator(
      () => onUpdateAchievement,
      async (iterator) => {
        const [result] = await Promise.all([
          iterator.next(),
          caller.webpageEditor.saveWebpageEditor(new WebpageEditor()),
        ]);
        return result;
      },
    );

    const unlockedAchievements = [] as unknown as AchievementEvents["updateAchievement"][0];

    assert(!data.done);

    expect(data.value).toHaveLength(updatedAchievements.length);

    for (const achievement of data.value) {
      expect(updatedAchievements).toContain(achievement.achievement.name);

      if (achievement.unlockedAt) unlockedAchievements.push(achievement);
    }

    expect(unlockedAchievements).toHaveLength(1);
    expect(takeOne(unlockedAchievements).achievement.name).toBe(WebpageAchievementName.WebDeveloper);
    expect(takeOne(unlockedAchievements).amount).toBe(1);
    expect(takeOne(unlockedAchievements).unlockedAt).toBeInstanceOf(Date);

    const userId = getMockSession().user.id;
    const userAchievement = await mockContext.db.query.userAchievements.findFirst({
      where: (userAchievements, { and, eq }) =>
        and(
          eq(userAchievements.achievementId, takeOne(unlockedAchievements).achievementId),
          eq(userAchievements.userId, userId),
        ),
      with: UserAchievementRelations,
    });
    assert(userAchievement);

    expect(userAchievement).toStrictEqual(takeOne(unlockedAchievements));
  });
});
