import type { InvestigationDay } from "#src/models/investigation/InvestigationDay";

import { computeInvestigationDay } from "#src/services/investigation/computeInvestigationDay";
import { DAILY_RESET, NOW } from "#src/services/investigation/constants.test";
import { describe, expect, test } from "vitest";

describe(computeInvestigationDay, () => {
  test("the day's count restarts at the 04:00 reset", () => {
    expect.hasAssertions();

    const yesterday: InvestigationDay = { count: 99, dayKey: DAILY_RESET.subtract({ minutes: 1 }) };

    expect(computeInvestigationDay(yesterday, NOW)).toStrictEqual({ count: 0, dayKey: undefined });
  });
});
