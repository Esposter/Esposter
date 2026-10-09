import { GAME_TIME_ZONE } from "#src/services/originalResin/constants";
import { computeMonthlyRefreshTime } from "#src/services/shop/computeMonthlyRefreshTime";
import { describe, expect, test } from "vitest";

describe(computeMonthlyRefreshTime, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  // The epoch is the first day's eight o'clock in the game's zone, four hours past that day's refresh
  const FIRST_MONTH_REFRESH = EPOCH.subtract({ hours: 4 });
  // The refresh of the month before, the first of the thirty-one days back from the epoch's day at its hour
  const PREVIOUS_MONTH_REFRESH = EPOCH.toZonedDateTimeISO(GAME_TIME_ZONE).subtract({ days: 31, hours: 4 }).toInstant();

  test("should count the month's refresh once its first day's game hour has come", () => {
    expect.hasAssertions();

    expect(computeMonthlyRefreshTime(EPOCH).epochMilliseconds).toBe(FIRST_MONTH_REFRESH.epochMilliseconds);
  });

  test("should count the month before's refresh until the first day's game hour comes", () => {
    expect.hasAssertions();

    expect(computeMonthlyRefreshTime(EPOCH.subtract({ hours: 5 })).epochMilliseconds).toBe(
      PREVIOUS_MONTH_REFRESH.epochMilliseconds,
    );
  });
});
