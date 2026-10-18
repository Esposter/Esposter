import { computeLastMonthlyReset } from "#src/services/time/computeLastMonthlyReset";
import { GAME_DAY_START_HOUR, GAME_TIME_ZONE } from "#src/services/time/constants";
import { describe, expect, test } from "vitest";

describe(computeLastMonthlyReset, () => {
  // The epoch is eight in the morning on the first of January in the server's zone, four hours past that day's 04:00 reset
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const MONTHLY_RESET = EPOCH.subtract({ hours: GAME_DAY_START_HOUR });

  test("the monthly reset falls on the first at 04:00", () => {
    expect.hasAssertions();

    expect(computeLastMonthlyReset(EPOCH).toString()).toBe(MONTHLY_RESET.toString());
    expect(computeLastMonthlyReset(EPOCH.add({ hours: 24 * 14 })).toString()).toBe(MONTHLY_RESET.toString());
  });

  test("the instant just before the first's 04:00 belongs to the month before", () => {
    expect.hasAssertions();

    expect(computeLastMonthlyReset(MONTHLY_RESET.subtract({ milliseconds: 1 })).toString()).toBe(
      MONTHLY_RESET.toZonedDateTimeISO(GAME_TIME_ZONE).subtract({ months: 1 }).toInstant().toString(),
    );
  });
});
