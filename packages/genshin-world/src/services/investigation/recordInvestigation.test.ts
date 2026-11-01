import type { InvestigationDay } from "#src/models/investigation/InvestigationDay";

import { checkIsInvestigationSpawning } from "#src/services/investigation/checkIsInvestigationSpawning";
import { INVESTIGATION_DAILY_CAP } from "#src/services/investigation/constants";
import { DAILY_RESET, NOW } from "#src/services/investigation/constants.test";
import { recordInvestigation } from "#src/services/investigation/recordInvestigation";
import { describe, expect, test } from "vitest";

describe(recordInvestigation, () => {
  test("the hundredth investigation stops new spawns", () => {
    expect.hasAssertions();

    const ninetyNinth: InvestigationDay = {
      count: INVESTIGATION_DAILY_CAP - 1,
      dayKey: DAILY_RESET.add({ minutes: 1 }),
    };
    const hundredth = recordInvestigation(ninetyNinth, NOW);

    expect(hundredth.count).toBe(INVESTIGATION_DAILY_CAP);
    expect(checkIsInvestigationSpawning(hundredth.count)).toBe(false);
  });
});
