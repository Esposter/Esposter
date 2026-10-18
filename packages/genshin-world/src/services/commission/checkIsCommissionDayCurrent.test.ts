import { checkIsCommissionDayCurrent } from "#src/services/commission/checkIsCommissionDayCurrent";
import { GAME_DAY_START_HOUR } from "#src/services/time/constants";
import { describe, expect, test } from "vitest";

describe(checkIsCommissionDayCurrent, () => {
  // The epoch is eight in the morning in the server's zone, four hours past that day's 04:00 reset
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const dailyReset = epoch.subtract({ hours: GAME_DAY_START_HOUR });
  const now = dailyReset.add({ hours: 12 });

  test("a day dealt before the daily reset is dealt again", () => {
    expect.hasAssertions();
    expect(checkIsCommissionDayCurrent(dailyReset.subtract({ minutes: 1 }), now)).toBe(false);
  });

  test("a day dealt at or after the daily reset is kept", () => {
    expect.hasAssertions();
    expect(checkIsCommissionDayCurrent(dailyReset, now)).toBe(true);
  });
});
