import type { InvestigationDay } from "#src/models/investigation/InvestigationDay";

import { computeInvestigationDay } from "#src/services/investigation/computeInvestigationDay";

// The game day after one more investigation at `now`: one more counted, and the day keyed at this investigation when it
// Has no key yet, since a day with no key has no investigation counted
export const recordInvestigation = (day: InvestigationDay, now: Temporal.Instant): InvestigationDay => {
  const current = computeInvestigationDay(day, now);
  return { count: current.count + 1, dayKey: current.dayKey ?? now };
};
