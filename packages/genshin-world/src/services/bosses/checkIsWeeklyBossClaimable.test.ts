import { checkIsWeeklyBossClaimable } from "#src/services/bosses/checkIsWeeklyBossClaimable";
import { DAILY_RESET_TIME } from "#src/services/enemy/constants";
import { describe, expect, test } from "vitest";

describe(checkIsWeeklyBossClaimable, () => {
  // The epoch is a Thursday, so four days on is the Monday that starts its week
  const epoch = Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO("UTC");
  const weeklyReset = epoch
    .toPlainDate()
    .add({ days: 4 })
    .toZonedDateTime({ plainTime: DAILY_RESET_TIME, timeZone: "UTC" });
  const now = weeklyReset.add({ days: 2 });

  test("a second claim of a weekly boss in the same week is refused", () => {
    expect.hasAssertions();

    expect(checkIsWeeklyBossClaimable([weeklyReset.add({ days: 1 })], now)).toBe(false);
  });

  test("a weekly boss's claim is available again after the weekly reset", () => {
    expect.hasAssertions();

    expect(checkIsWeeklyBossClaimable([weeklyReset.subtract({ weeks: 1 })], now)).toBe(true);
    expect(checkIsWeeklyBossClaimable([], now)).toBe(true);
  });
});
