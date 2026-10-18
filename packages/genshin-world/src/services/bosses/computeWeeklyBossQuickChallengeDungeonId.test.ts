import { WEEKLY_BOSS_QUICK_CHALLENGE_ADVENTURE_RANK } from "#src/services/bosses/constants";
import { computeWeeklyBossQuickChallengeDungeonId } from "#src/services/bosses/computeWeeklyBossQuickChallengeDungeonId";
import { describe, expect, test } from "vitest";

// Made-up tiers, each with its own dungeon, in the order a weekly boss's schedule lists them
const LEVELS = [
  { dungeonId: 901, recommendedRank: 10 },
  { dungeonId: 902, recommendedRank: 20 },
  { dungeonId: 903, recommendedRank: 30 },
  { dungeonId: 904, recommendedRank: 40 },
  { dungeonId: 905, recommendedRank: 50 },
];

describe(computeWeeklyBossQuickChallengeDungeonId, () => {
  test("a locked weekly boss is challenged from the handbook at Adventure Rank 40", () => {
    expect.hasAssertions();

    expect(computeWeeklyBossQuickChallengeDungeonId(LEVELS, WEEKLY_BOSS_QUICK_CHALLENGE_ADVENTURE_RANK, true)).toBe(
      904,
    );
  });

  test("a quick challenge enters the highest tier the rank reaches", () => {
    expect.hasAssertions();

    expect(computeWeeklyBossQuickChallengeDungeonId(LEVELS, 45, true)).toBe(904);
  });

  test("an unlocked weekly boss enters no quick challenge", () => {
    expect.hasAssertions();

    expect(computeWeeklyBossQuickChallengeDungeonId(LEVELS, 50, false)).toBeUndefined();
  });
});
