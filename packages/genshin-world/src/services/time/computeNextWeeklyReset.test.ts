import { GAME_DAY_START_HOUR } from "#src/services/time/constants";
import { computeNextWeeklyReset } from "#src/services/time/computeNextWeeklyReset";
import { describe, expect, test } from "vitest";

describe(computeNextWeeklyReset, () => {
  // The epoch is a Thursday eight in the morning in the server's zone, so the Monday after it is four days on, less four hours
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const NEXT_WEEKLY_RESET = EPOCH.add({ hours: 24 * 4 - GAME_DAY_START_HOUR });

  test("the next weekly reset is the Monday 04:00 after the week's reset", () => {
    expect.hasAssertions();

    expect(computeNextWeeklyReset(EPOCH).toString()).toBe(NEXT_WEEKLY_RESET.toString());
  });

  test("a moment at the reset itself counts the following week's reset, not that one", () => {
    expect.hasAssertions();

    expect(computeNextWeeklyReset(NEXT_WEEKLY_RESET).toString()).toBe(
      NEXT_WEEKLY_RESET.add({ hours: 24 * 7 }).toString(),
    );
  });
});
