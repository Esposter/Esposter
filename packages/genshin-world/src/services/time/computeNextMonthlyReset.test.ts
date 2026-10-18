import { computeNextMonthlyReset } from "#src/services/time/computeNextMonthlyReset";
import { GAME_DAY_START_HOUR } from "#src/services/time/constants";
import { describe, expect, test } from "vitest";

describe(computeNextMonthlyReset, () => {
  // The epoch is the first of January in the server's zone, and January holds thirty-one days
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const FEBRUARY_RESET = EPOCH.add({ hours: 24 * 31 - GAME_DAY_START_HOUR });

  test("the next monthly reset is the first of the next month at 04:00", () => {
    expect.hasAssertions();

    expect(computeNextMonthlyReset(EPOCH).toString()).toBe(FEBRUARY_RESET.toString());
  });

  test("a moment at the reset itself counts the following month's reset, not that one", () => {
    expect.hasAssertions();

    // February holds twenty-eight days in the year the epoch begins
    expect(computeNextMonthlyReset(FEBRUARY_RESET).toString()).toBe(FEBRUARY_RESET.add({ hours: 24 * 28 }).toString());
  });
});
