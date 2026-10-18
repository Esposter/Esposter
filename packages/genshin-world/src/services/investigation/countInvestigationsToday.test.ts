import { countInvestigationsToday } from "#src/services/investigation/countInvestigationsToday";
import { describe, expect, test } from "vitest";

describe(countInvestigationsToday, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  // The epoch is eight in the morning in the game's time zone, four hours past that day's daily reset
  const DAILY_RESET = EPOCH.subtract({ hours: 4 });
  const now = DAILY_RESET.add({ hours: 1 });

  test("investigations before the reset do not count toward the new day", () => {
    expect.hasAssertions();

    const investigatedAts = [DAILY_RESET.subtract({ minutes: 1 }), DAILY_RESET, now];

    expect(countInvestigationsToday(investigatedAts, now)).toBe(2);
  });
});
