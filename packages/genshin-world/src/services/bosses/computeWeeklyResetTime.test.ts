import { computeWeeklyResetTime } from "#src/services/bosses/computeWeeklyResetTime";
import { DAILY_RESET_TIME } from "#src/services/enemy/constants";
import { describe, expect, test } from "vitest";

describe(computeWeeklyResetTime, () => {
  // The epoch is a Thursday, so four days on is the Monday that starts its week
  const epoch = Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO("UTC");
  const weeklyReset = epoch
    .toPlainDate()
    .add({ days: 4 })
    .toZonedDateTime({ plainTime: DAILY_RESET_TIME, timeZone: "UTC" });

  test("the reset itself is this week's, and a moment before it is last week's", () => {
    expect.hasAssertions();

    expect(computeWeeklyResetTime(weeklyReset).toString()).toBe(weeklyReset.toString());
    expect(computeWeeklyResetTime(weeklyReset.subtract({ minutes: 1 })).toString()).toBe(
      weeklyReset.subtract({ weeks: 1 }).toString(),
    );
  });

  test("a moment later in the week, Sunday included, resets to that week's Monday", () => {
    expect.hasAssertions();

    expect(computeWeeklyResetTime(weeklyReset.add({ days: 3 })).toString()).toBe(weeklyReset.toString());
    expect(computeWeeklyResetTime(weeklyReset.add({ days: 6, hours: 12 })).toString()).toBe(weeklyReset.toString());
  });

  test("the reset is the Monday at the daily reset's hour in the reader's own time zone", () => {
    expect.hasAssertions();

    const tokyoWeeklyReset = epoch
      .toPlainDate()
      .add({ days: 4 })
      .toZonedDateTime({ plainTime: DAILY_RESET_TIME, timeZone: "Asia/Tokyo" });

    expect(computeWeeklyResetTime(tokyoWeeklyReset.subtract({ seconds: 1 })).toString()).toBe(
      tokyoWeeklyReset.subtract({ weeks: 1 }).toString(),
    );
  });
});
