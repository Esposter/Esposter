import { checkIsWeeklyBossClaimable } from "#src/services/bosses/checkIsWeeklyBossClaimable";
import { GAME_DAY_START_HOUR } from "#src/services/time/constants";
import { describe, expect, test } from "vitest";

describe(checkIsWeeklyBossClaimable, () => {
  // The epoch is a Thursday, so the Monday that starts its week is four days on, at the server's 04:00 reset
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const weeklyReset = epoch.add({ hours: 24 * 4 - GAME_DAY_START_HOUR });
  const now = weeklyReset.add({ hours: 24 * 2 });

  test("a second claim of a weekly boss in the same week is refused", () => {
    expect.hasAssertions();

    expect(checkIsWeeklyBossClaimable([weeklyReset.add({ hours: 24 })], now)).toBe(false);
  });

  test("a weekly boss's claim is available again after the weekly reset", () => {
    expect.hasAssertions();

    expect(checkIsWeeklyBossClaimable([weeklyReset.subtract({ hours: 24 * 7 })], now)).toBe(true);
    expect(checkIsWeeklyBossClaimable([], now)).toBe(true);
  });
});
