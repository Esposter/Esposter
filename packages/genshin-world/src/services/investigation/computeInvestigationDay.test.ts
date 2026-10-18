import type { InvestigationDay } from "#src/models/investigation/InvestigationDay";

import { computeInvestigationDay } from "#src/services/investigation/computeInvestigationDay";
import { describe, expect, test } from "vitest";

describe(computeInvestigationDay, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  // The epoch is eight in the morning in the game's time zone, four hours past that day's daily reset
  const DAILY_RESET = EPOCH.subtract({ hours: 4 });
  const now = DAILY_RESET.add({ hours: 1 });

  test("the day's count restarts at the 04:00 reset", () => {
    expect.hasAssertions();

    const yesterday: InvestigationDay = { count: 99, dayKey: DAILY_RESET.subtract({ minutes: 1 }) };

    expect(computeInvestigationDay(yesterday, now)).toStrictEqual({ count: 0, dayKey: undefined });
  });
});
