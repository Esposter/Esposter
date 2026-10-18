import { computeLastDailyReset } from "#src/services/time/computeLastDailyReset";
import { GAME_DAY_START_HOUR, GAME_TIME_ZONE } from "#src/services/time/constants";
import { describe, expect, test } from "vitest";

describe(computeLastDailyReset, () => {
  // The epoch is eight in the morning in the server's zone, four hours past that day's 04:00 reset
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const DAILY_RESET = EPOCH.subtract({ hours: GAME_DAY_START_HOUR });

  test("a reader in another zone sees the daily reset at the server's 04:00", () => {
    expect.hasAssertions();

    const reset = computeLastDailyReset(EPOCH);

    expect(reset.toString()).toBe(DAILY_RESET.toString());
    expect(reset.toZonedDateTimeISO(GAME_TIME_ZONE).hour).toBe(GAME_DAY_START_HOUR);
    // The reader in New York sees the server's 04:00 reset on the day before the server's date
    expect(reset.toZonedDateTimeISO("America/New_York").toPlainDate().toString()).toBe(
      EPOCH.toZonedDateTimeISO(GAME_TIME_ZONE).toPlainDate().subtract({ days: 1 }).toString(),
    );
  });

  test("the instant just before 04:00 belongs to the previous day", () => {
    expect.hasAssertions();

    expect(computeLastDailyReset(DAILY_RESET.subtract({ milliseconds: 1 })).toString()).toBe(
      DAILY_RESET.subtract({ hours: 24 }).toString(),
    );
  });

  test("a moment at or after 04:00 has that day's reset as its last", () => {
    expect.hasAssertions();

    expect(computeLastDailyReset(DAILY_RESET).toString()).toBe(DAILY_RESET.toString());
    expect(computeLastDailyReset(EPOCH).toString()).toBe(DAILY_RESET.toString());
  });
});
