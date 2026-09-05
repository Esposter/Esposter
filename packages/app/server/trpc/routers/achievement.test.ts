import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { AchievementDefinitionMap } from "#shared/services/achievement/AchievementDefinitionMap";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { trpcRouter } from "@@/server/trpc/routers";
import { getFirstEmit } from "@@/server/trpc/routers/getFirstEmit.test";
import {
  achievements,
  resources,
  roomsInMessage,
  SpecialAchievementName,
  UserAchievementRelations,
  WebpageAchievementName,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { MockContainerDatabase, MockTableDatabase } from "azure-mock";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

describe("achievement", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["_def"]["procedures"]>;
  const name = "name";
  const updatedAchievements = [WebpageAchievementName.WebDeveloper];

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(trpcRouter)(mockContext);
  });

  // `unlockedAt` is stamped from `new Date()`, so a frozen clock makes it exactly assertable. Only `Date` is
  // Faked: vitest's default set includes `process.hrtime`, which is what `now()` reads for the nanosecond tick
  // Every Azure Table row key is built from — freeze that and every row a test writes to one partition lands on
  // The same key, so the second is rejected `409` and swallowed by the best-effort activity writer
  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(async () => {
    vi.useRealTimers();
    MockContainerDatabase.clear();
    // The message a test sends to earn an achievement lands in Azure Table, so it is cleaned here like every
    // Other row the test wrote
    MockTableDatabase.clear();
    await mockContext.db.delete(resources);
    await mockContext.db.delete(roomsInMessage);
    await mockContext.db.delete(achievements);
  });

  // Masking is what the map endpoint adds over the definitions, so that is what is asserted — restating every
  // Definition instead would fail on any edit to the catalogue and on none to the masking
  test("readAchievementMap masks a hidden achievement description until it is unlocked", async () => {
    expect.hasAssertions();

    const achievementMap = await caller.achievement.readAchievementMap();

    expect(achievementMap[SpecialAchievementName.EmojiLover].description).toBe("???");
  });

  test("readAchievementMap reveals a hidden achievement description once it is unlocked", async () => {
    expect.hasAssertions();

    const room = await caller.room.createRoom({ name });
    await caller.message.createMessage({
      message: "😀😀😀😀😀😀😀😀😀😀",
      roomId: room.id,
    });
    const achievementMap = await caller.achievement.readAchievementMap();

    expect(achievementMap[SpecialAchievementName.EmojiLover].description).toBe(
      AchievementDefinitionMap[SpecialAchievementName.EmojiLover].description,
    );
  });

  test("readUserAchievements reads own achievements", async () => {
    expect.hasAssertions();

    const userAchievements = await caller.achievement.readUserAchievements();

    expect(userAchievements).toStrictEqual([]);
  });

  // The endpoint is public, so this is the difference between a profile and a progress report: one message
  // Unlocks FirstMessage and starts CenturyClub, and only the unlocked one is anyone else business
  test("readUserAchievements reads another user unlocked achievements only", async () => {
    expect.hasAssertions();

    const room = await caller.room.createRoom({ name });
    await caller.message.createMessage({ message: name, roomId: room.id });
    const ownerId = getMockSession().user.id;
    const ownAchievements = await caller.achievement.readUserAchievements();

    expect(ownAchievements.some(({ unlockedAt }) => !unlockedAt)).toBe(true);

    await mockSessionOnce(mockContext.db);
    const otherAchievements = await caller.achievement.readUserAchievements(ownerId);

    expect(otherAchievements).not.toStrictEqual([]);
    expect(otherAchievements.every(({ unlockedAt }) => unlockedAt)).toBe(true);
    expect(otherAchievements.length).toBeLessThan(ownAchievements.length);
  });

  test("readPointsLeaderboard ranks the authed user first once they have earned a point", async () => {
    expect.hasAssertions();

    const emptyLeaderboard = await caller.achievement.readPointsLeaderboard();

    expect(emptyLeaderboard.entries).toStrictEqual([]);
    expect(emptyLeaderboard.myEntry).toBeUndefined();

    const newResource = await caller.webpage.createResource({ name });
    await caller.webpage.saveResourceContent({
      content: new WebpageEditor(),
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    const leaderboard = await caller.achievement.readPointsLeaderboard();
    const leaderboardEntry = takeOne(leaderboard.entries);

    expect(leaderboard.entries).toHaveLength(1);
    expect(leaderboardEntry.user.id).toBe(getMockSession().user.id);
    expect(leaderboardEntry.rank).toBe(1);
    expect(leaderboard.myEntry).toStrictEqual(leaderboardEntry);
  });

  test("onUpdateAchievement emits every achievement the save moved", async () => {
    expect.hasAssertions();

    const newResource = await caller.webpage.createResource({ name });
    const onUpdateAchievement = await caller.achievement.onUpdateAchievement();
    const data = await getFirstEmit(
      () => onUpdateAchievement,
      () =>
        caller.webpage.saveResourceContent({
          content: new WebpageEditor(),
          contentVersion: newResource.contentVersion,
          id: newResource.id,
        }),
    );
    const unlockedAchievement = takeOne(data.filter(({ unlockedAt }) => unlockedAt));

    expect(data.map(({ achievement }) => achievement.name)).toStrictEqual(updatedAchievements);
    expect(unlockedAchievement.achievement.name).toBe(WebpageAchievementName.WebDeveloper);
    expect(unlockedAchievement.amount).toBe(1);
    expect(unlockedAchievement.unlockedAt).toStrictEqual(new Date(0));

    const userId = getMockSession().user.id;
    const userAchievement = await mockContext.db.query.userAchievements.findFirst({
      where: {
        achievementId: {
          eq: unlockedAchievement.achievementId,
        },
        userId: {
          eq: userId,
        },
      },
      with: UserAchievementRelations,
    });

    assert.exists(userAchievement);

    expect(userAchievement).toStrictEqual(unlockedAchievement);
  });
});
