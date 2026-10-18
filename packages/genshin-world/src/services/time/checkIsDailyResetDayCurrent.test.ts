import { checkIsDailyResetDayCurrent } from "#src/services/time/checkIsDailyResetDayCurrent";
import { GAME_DAY_START_HOUR } from "#src/services/time/constants";
import { describe, expect, test } from "vitest";

describe(checkIsDailyResetDayCurrent, () => {
  // The epoch is eight in the morning in the server's zone, four hours past that day's 04:00 reset
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const dailyReset = epoch.subtract({ hours: GAME_DAY_START_HOUR });
  const now = dailyReset.add({ hours: 12 });

  test("a day keyed before the daily reset is stale", () => {
    expect.hasAssertions();
    expect(checkIsDailyResetDayCurrent(dailyReset.subtract({ minutes: 1 }), now)).toBe(false);
  });

  test("a day keyed at or after the daily reset is kept", () => {
    expect.hasAssertions();
    expect(checkIsDailyResetDayCurrent(dailyReset, now)).toBe(true);
  });

  test("a day keyed after the daily reset is kept until the next one", () => {
    expect.hasAssertions();
    expect(checkIsDailyResetDayCurrent(dailyReset.add({ hours: 1 }), dailyReset.add({ hours: 23 }))).toBe(true);
    expect(checkIsDailyResetDayCurrent(dailyReset.add({ hours: 1 }), dailyReset.add({ hours: 24 }))).toBe(false);
  });
});
