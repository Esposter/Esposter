import { checkIsWeeklyBossQuickChallengeable } from "#src/services/bosses/checkIsWeeklyBossQuickChallengeable";
import { WEEKLY_BOSS_QUICK_CHALLENGE_ADVENTURE_RANK } from "#src/services/bosses/constants";
import { describe, expect, test } from "vitest";

describe(checkIsWeeklyBossQuickChallengeable, () => {
  test("a locked weekly boss is challenged from the handbook at adventure rank 40", () => {
    expect.hasAssertions();

    expect(checkIsWeeklyBossQuickChallengeable(WEEKLY_BOSS_QUICK_CHALLENGE_ADVENTURE_RANK, true)).toBe(true);
  });

  test("a locked weekly boss cannot be challenged below adventure rank 40", () => {
    expect.hasAssertions();

    expect(checkIsWeeklyBossQuickChallengeable(WEEKLY_BOSS_QUICK_CHALLENGE_ADVENTURE_RANK - 1, true)).toBe(false);
  });
});
