import { computeDailyResetTime } from "#src/services/commission/computeDailyResetTime";
import { DAILY_RESET_TIME } from "#src/services/enemy/constants";
import { describe, expect, test } from "vitest";

describe(computeDailyResetTime, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO("UTC");
  const dailyReset = epoch.toPlainDate().toZonedDateTime({ plainTime: DAILY_RESET_TIME, timeZone: "UTC" });

  test("a moment before the daily reset reads the day before's reset", () => {
    expect.hasAssertions();
    expect(computeDailyResetTime(dailyReset.subtract({ minutes: 1 })).toString()).toBe(
      dailyReset.subtract({ days: 1 }).toString(),
    );
  });

  test("a moment at the daily reset reads its own reset", () => {
    expect.hasAssertions();
    expect(computeDailyResetTime(dailyReset).toString()).toBe(dailyReset.toString());
  });
});
