import type { InvestigationDay } from "#src/models/investigation/InvestigationDay";

import { INVESTIGATION_DAILY_CAP } from "#src/services/investigation/constants";
import { DAILY_RESET, NOW } from "#src/services/investigation/constants.test";
import { recordInvestigation } from "#src/services/investigation/recordInvestigation";
import { describe, expect, test } from "vitest";

describe(recordInvestigation, () => {
  test("recording an investigation counts the day up to its daily cap", () => {
    expect.hasAssertions();

    const ninetyNinth: InvestigationDay = {
      count: INVESTIGATION_DAILY_CAP - 1,
      dayKey: DAILY_RESET.add({ minutes: 1 }),
    };

    expect(recordInvestigation(ninetyNinth, NOW).count).toBe(INVESTIGATION_DAILY_CAP);
  });
});
