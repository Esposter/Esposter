import { buildPointsLeaderboard } from "@@/server/services/achievement/buildPointsLeaderboard";
import { describe, expect, test } from "vitest";

const createUserTotal = (userId: string, points: number, unlockCount = 1) => ({
  points,
  unlockCount,
  user: { id: userId, image: "", name: "" },
});

describe(buildPointsLeaderboard, () => {
  const highUserId = crypto.randomUUID();
  const lowUserId = crypto.randomUUID();
  const highPoints = 1;
  const lowPoints = 0;

  test("ranks users by summed points descending", () => {
    expect.hasAssertions();

    const { entries } = buildPointsLeaderboard([
      createUserTotal(lowUserId, lowPoints, 2),
      createUserTotal(highUserId, highPoints),
    ]);

    expect(entries).toStrictEqual([
      { points: highPoints, rank: 1, unlockCount: 1, user: { id: highUserId, image: "", name: "" } },
      { points: lowPoints, rank: 2, unlockCount: 2, user: { id: lowUserId, image: "", name: "" } },
    ]);
  });

  test("gives users with equal totals the same competition rank", () => {
    expect.hasAssertions();

    const { entries } = buildPointsLeaderboard([
      createUserTotal(highUserId, highPoints),
      createUserTotal(crypto.randomUUID(), highPoints),
      createUserTotal(lowUserId, lowPoints),
    ]);

    expect(entries.map(({ rank }) => rank)).toStrictEqual([1, 1, 3]);
  });

  test("returns the caller's own entry with its global rank via myEntry", () => {
    expect.hasAssertions();

    const { myEntry } = buildPointsLeaderboard(
      [createUserTotal(highUserId, highPoints), createUserTotal(lowUserId, lowPoints)],
      lowUserId,
    );

    expect(myEntry).toStrictEqual({
      points: lowPoints,
      rank: 2,
      unlockCount: 1,
      user: { id: lowUserId, image: "", name: "" },
    });
  });

  test("myEntry is undefined when the caller has unlocked nothing", () => {
    expect.hasAssertions();

    const { myEntry } = buildPointsLeaderboard([createUserTotal(highUserId, highPoints)], "-1");

    expect(myEntry).toBeUndefined();
  });
});
