import type { InvestigationDay } from "#src/models/investigation/InvestigationDay";

import { checkIsInvestigationSpawning } from "#src/services/investigation/checkIsInvestigationSpawning";
import { INVESTIGATION_DAILY_CAP } from "#src/services/investigation/constants";
import { recordInvestigation } from "#src/services/investigation/recordInvestigation";
import { describe, expect, test } from "vitest";

describe(recordInvestigation, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  // The epoch is eight in the morning in the game's time zone, four hours past that day's daily reset
  const DAILY_RESET = EPOCH.subtract({ hours: 4 });
  const now = DAILY_RESET.add({ hours: 1 });

  test("the hundredth investigation stops new spawns", () => {
    expect.hasAssertions();

    const ninetyNinth: InvestigationDay = {
      count: INVESTIGATION_DAILY_CAP - 1,
      dayKey: DAILY_RESET.add({ minutes: 1 }),
    };
    const hundredth = recordInvestigation(ninetyNinth, now);

    expect(hundredth.count).toBe(INVESTIGATION_DAILY_CAP);
    expect(checkIsInvestigationSpawning(hundredth.count)).toBe(false);
  });
});
