import { buildPointsLeaderboard } from "@@/server/services/achievement/buildPointsLeaderboard";
import { describe, expect, test } from "vitest";

const createUserTotal = (userId: string, points: number, unlockCount = 1) => ({
  points,
  unlockCount,
  user: { id: userId, image: "", name: userId },
});

describe(buildPointsLeaderboard, () => {
  const HIGH_POINTS = 50;
  const LOW_POINTS = 10;

  test("ranks users by summed points descending", () => {
    expect.hasAssertions();

    const { entries } = buildPointsLeaderboard([
      createUserTotal("low", LOW_POINTS, 2),
      createUserTotal("high", HIGH_POINTS),
    ]);

    expect(entries).toStrictEqual([
      { points: HIGH_POINTS, rank: 1, unlockCount: 1, user: { id: "high", image: "", name: "high" } },
      { points: LOW_POINTS, rank: 2, unlockCount: 2, user: { id: "low", image: "", name: "low" } },
    ]);
  });

  test("gives users with equal totals the same competition rank", () => {
    expect.hasAssertions();

    const { entries } = buildPointsLeaderboard([
      createUserTotal("a", HIGH_POINTS),
      createUserTotal("b", HIGH_POINTS),
      createUserTotal("c", LOW_POINTS),
    ]);

    expect(entries.map(({ rank }) => rank)).toStrictEqual([1, 1, 3]);
  });

  test("returns the caller's own entry with its global rank via self", () => {
    expect.hasAssertions();

    const { self } = buildPointsLeaderboard(
      [createUserTotal("high", HIGH_POINTS), createUserTotal("low", LOW_POINTS)],
      "low",
    );

    expect(self).toStrictEqual({
      points: LOW_POINTS,
      rank: 2,
      unlockCount: 1,
      user: { id: "low", image: "", name: "low" },
    });
  });

  test("self is undefined when the caller has unlocked nothing", () => {
    expect.hasAssertions();

    const { self } = buildPointsLeaderboard([createUserTotal("high", HIGH_POINTS)], "absent");

    expect(self).toBeUndefined();
  });
});
