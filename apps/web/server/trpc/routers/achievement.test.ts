import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers/index";
import type { UserAchievementInAchievementWithRelations } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { userObjectCalls } from "#server/composables/realtime/useUserObject.test";
import { createMockAuthSession, createMockCaller, createMockUser, getMockSession } from "#server/trpc/context.test";
import { trpcRouter } from "#server/trpc/routers/index";
import { setupResourceSuite } from "#server/trpc/routers/setupResourceSuite.test";
import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { AchievementDefinitionMap } from "#shared/services/achievement/AchievementDefinitionMap";
import { EMOJI_LOVER_EMOJI_COUNT, HIDDEN_ACHIEVEMENT_DESCRIPTION } from "#shared/services/achievement/constants";
import {
  achievementsInAchievement,
  roomsInMessage,
  SpecialAchievementName,
  usersInAuth,
  WebpageAchievementName,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { count } from "drizzle-orm";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

// A field every definition carries that the client never takes, standing for a predicate or schema one may add
vi.mock(import("#shared/services/achievement/AchievementDefinitionMap"), async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    AchievementDefinitionMap: Object.fromEntries(
      Object.entries(actual.AchievementDefinitionMap).map(([name, definition]) => [
        name,
        { ...definition, serverOnlyField: true },
      ]),
    ) as typeof actual.AchievementDefinitionMap,
  };
});

describe("achievementRouter", () => {
  const { getCaller, getMockContext } = setupResourceSuite(trpcRouter);
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["_def"]["procedures"]>;
  const name = "name";
  const timeZone = "UTC";

  beforeAll(() => {
    mockContext = getMockContext();
    caller = getCaller();
  });

  // `unlockedAt` is stamped from `new Date()`, so a frozen clock makes it exactly assertable
  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(async () => {
    vi.useRealTimers();
    await mockContext.db.delete(roomsInMessage);
    await mockContext.db.delete(achievementsInAchievement);
    userObjectCalls.length = 0;
  });

  // The unlocks below are earned by saving an empty webpage, so each test that needs one starts from this
  const createSavedWebpage = async () => {
    const newResource = await caller.webpage.createResource({ name });
    await caller.webpage.saveResourceContent({
      content: new WebpageEditor(),
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    return newResource;
  };

  // Masking is what the map endpoint adds over the definitions, so that is what is asserted — restating every
  // Definition instead would fail on any edit to the catalogue and on none to the masking
  test("readAchievementMap masks a hidden achievement description until it is unlocked", async () => {
    expect.hasAssertions();

    const achievementMap = await caller.achievement.readAchievementMap();

    expect(achievementMap[SpecialAchievementName.EmojiLover].description).toBe(HIDDEN_ACHIEVEMENT_DESCRIPTION);
  });

  test("readAchievementMap reveals a hidden achievement description once it is unlocked", async () => {
    expect.hasAssertions();

    const room = await caller.room.createRoom({ name });
    await caller.message.createMessage({ message: "😀".repeat(EMOJI_LOVER_EMOJI_COUNT), roomId: room.id, timeZone });
    const achievementMap = await caller.achievement.readAchievementMap();

    expect(achievementMap[SpecialAchievementName.EmojiLover].description).toBe(
      AchievementDefinitionMap[SpecialAchievementName.EmojiLover].description,
    );
  });

  // The map ships the fields a client takes, named one by one, so a field a definition gains stays on the server
  test("readAchievementMap ships only the fields a client takes", async () => {
    expect.hasAssertions();

    const achievementMap = await caller.achievement.readAchievementMap();

    expect(Object.values(achievementMap).filter((view) => "serverOnlyField" in view)).toStrictEqual([]);
  });

  // The map is sent as JSON, and a trigger's zod schema is circular, so the payload must not carry it
  test("readAchievementMap serializes to JSON", async () => {
    expect.hasAssertions();

    const achievementMap = await caller.achievement.readAchievementMap();

    expect(() => JSON.stringify(achievementMap)).not.toThrow();
  });

  // The endpoint is public, so this is the difference between a profile and a progress report: one message
  // Unlocks FirstMessage and starts CenturyClub, and only the unlocked one is anyone else business
  test("readUserAchievements reads another user unlocked achievements only", async () => {
    expect.hasAssertions();

    const room = await caller.room.createRoom({ name });
    await caller.message.createMessage({ message: name, roomId: room.id, timeZone });
    const ownerId = getMockSession().user.id;
    const ownAchievements = await caller.achievement.readUserAchievements();

    expect(ownAchievements.some(({ unlockedAt }) => !unlockedAt)).toBe(true);

    const otherUserAuthSession = await createMockAuthSession(mockContext.db);
    const otherUserCaller = await createMockCaller(trpcRouter, otherUserAuthSession);
    const otherAchievements = await otherUserCaller.achievement.readUserAchievements(ownerId);

    expect(otherAchievements).not.toStrictEqual([]);
    expect(otherAchievements).toStrictEqual(ownAchievements.filter(({ unlockedAt }) => unlockedAt));
  });

  test("readPointsLeaderboard ranks the authed user first once they have earned a point", async () => {
    expect.hasAssertions();

    const emptyLeaderboard = await caller.achievement.readPointsLeaderboard();

    expect(emptyLeaderboard.entries).toStrictEqual([]);
    expect(emptyLeaderboard.myEntry).toBeUndefined();

    await createSavedWebpage();
    const leaderboard = await caller.achievement.readPointsLeaderboard();
    const leaderboardEntry = takeOne(leaderboard.entries);

    expect(leaderboard.entries).toHaveLength(1);
    expect(leaderboardEntry.user.id).toBe(getMockSession().user.id);
    expect(leaderboardEntry.rank).toBe(1);
    expect(leaderboard.myEntry).toStrictEqual(leaderboardEntry);
  });

  test("an earned achievement survives the cutover", async () => {
    expect.hasAssertions();

    const newResource = await createSavedWebpage();
    const readUnlockedAchievementIds = async () =>
      (await caller.achievement.readUserAchievements())
        .filter(({ unlockedAt }) => unlockedAt)
        .map(({ achievementId }) => achievementId);
    const unlockedBeforePurge = await readUnlockedAchievementIds();
    await caller.resource.deleteResources({ ids: [newResource.id] });
    await caller.resource.purgeResource({ id: newResource.id });

    expect(unlockedBeforePurge).not.toStrictEqual([]);
    await expect(readUnlockedAchievementIds()).resolves.toStrictEqual(unlockedBeforePurge);
  });

  test("readAchievementRarities reports the share of users who have unlocked each achievement", async () => {
    expect.hasAssertions();

    await createSavedWebpage();
    await createMockUser(mockContext.db);
    const { totalUsers } = takeOne(await mockContext.db.select({ totalUsers: count() }).from(usersInAuth));
    const achievementRarities = await caller.achievement.readAchievementRarities();

    expect(achievementRarities[WebpageAchievementName.WebDeveloper]).toBe((1 / totalUsers) * 100);
    expect(achievementRarities[SpecialAchievementName.EmojiLover]).toBe(0);
  });

  test("updateAchievement sends every achievement the save moved to the saver's object", async () => {
    expect.hasAssertions();

    await createSavedWebpage();

    const updateAchievementCalls = userObjectCalls.filter(({ method }) => method === "updateAchievement");
    expect(updateAchievementCalls).toHaveLength(1);
    const updateAchievementCall = takeOne(updateAchievementCalls);
    const updatedAchievements = takeOne(updateAchievementCall.args) as UserAchievementInAchievementWithRelations[];
    expect(updatedAchievements).toHaveLength(1);
    const updatedAchievement = takeOne(updatedAchievements);

    expect(updateAchievementCall.userId).toBe(getMockSession().user.id);
    expect(updatedAchievement.achievement.name).toBe(WebpageAchievementName.WebDeveloper);
    expect(updatedAchievement.amount).toBe(1);
    expect(updatedAchievement.unlockedAt).toStrictEqual(new Date(0));
  });
});
