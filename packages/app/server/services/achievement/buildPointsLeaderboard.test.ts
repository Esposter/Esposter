import type { AchievementName } from "@esposter/db-schema";

import { AchievementDefinitionMap } from "#shared/services/achievement/achievementDefinitions";
import { buildPointsLeaderboard } from "@@/server/services/achievement/buildPointsLeaderboard";
import { SpecialAchievementName } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

const createRow = (userId: string, name: AchievementName) => ({
  achievement: { name },
  user: { id: userId, image: "", name: userId },
  userId,
});
// SpecialAchievementName.Meta is worth more than AllCaps, so a single Meta unlock outscores two AllCaps unlocks.
const HIGH_POINTS_NAME = SpecialAchievementName.Meta;
const LOW_POINTS_NAME = SpecialAchievementName.AllCaps;

describe(buildPointsLeaderboard, () => {
  test("ranks users by summed points descending and counts their unlocks", () => {
    expect.hasAssertions();

    const { entries } = buildPointsLeaderboard([
      createRow("low", LOW_POINTS_NAME),
      createRow("low", SpecialAchievementName.AllLower),
      createRow("high", HIGH_POINTS_NAME),
    ]);

    expect(entries).toStrictEqual([
      {
        points: AchievementDefinitionMap[HIGH_POINTS_NAME].points,
        rank: 1,
        unlockCount: 1,
        user: { id: "high", image: "", name: "high" },
      },
      {
        points:
          AchievementDefinitionMap[LOW_POINTS_NAME].points +
          AchievementDefinitionMap[SpecialAchievementName.AllLower].points,
        rank: 2,
        unlockCount: 2,
        user: { id: "low", image: "", name: "low" },
      },
    ]);
  });

  test("gives users with equal totals the same competition rank", () => {
    expect.hasAssertions();

    const { entries } = buildPointsLeaderboard([createRow("a", HIGH_POINTS_NAME), createRow("b", HIGH_POINTS_NAME)]);

    expect(entries.map(({ rank }) => rank)).toStrictEqual([1, 1]);
  });

  test("returns the caller's own entry with its global rank via self", () => {
    expect.hasAssertions();

    const { self } = buildPointsLeaderboard(
      [createRow("high", HIGH_POINTS_NAME), createRow("low", LOW_POINTS_NAME)],
      "low",
    );

    expect(self).toStrictEqual({
      points: AchievementDefinitionMap[LOW_POINTS_NAME].points,
      rank: 2,
      unlockCount: 1,
      user: { id: "low", image: "", name: "low" },
    });
  });

  test("self is null when the caller has unlocked nothing", () => {
    expect.hasAssertions();

    const { self } = buildPointsLeaderboard([createRow("high", HIGH_POINTS_NAME)], "absent");

    expect(self).toBeNull();
  });
});
