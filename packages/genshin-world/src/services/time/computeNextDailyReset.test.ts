import { GAME_DAY_START_HOUR } from "#src/services/time/constants";
import { computeNextDailyReset } from "#src/services/time/computeNextDailyReset";
import { describe, expect, test } from "vitest";

describe(computeNextDailyReset, () => {
  // The epoch is eight in the morning in the server's zone, four hours past that day's 04:00 reset
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const DAILY_RESET = EPOCH.subtract({ hours: GAME_DAY_START_HOUR });

  test("the next daily reset is the 04:00 a day after the last one", () => {
    expect.hasAssertions();

    expect(computeNextDailyReset(EPOCH).toString()).toBe(DAILY_RESET.add({ hours: 24 }).toString());
  });

  test("a moment at the reset itself counts the next day's reset, not that one", () => {
    expect.hasAssertions();

    expect(computeNextDailyReset(DAILY_RESET).toString()).toBe(DAILY_RESET.add({ hours: 24 }).toString());
    expect(computeNextDailyReset(DAILY_RESET.subtract({ milliseconds: 1 })).toString()).toBe(DAILY_RESET.toString());
  });
});
