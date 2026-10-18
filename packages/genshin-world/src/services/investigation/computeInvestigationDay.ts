import type { InvestigationDay } from "#src/models/investigation/InvestigationDay";

import { computeLastDailyReset } from "#src/services/time/computeLastDailyReset";

// The game day's investigations at `now`: the day kept while its key is at or after the daily reset at or before `now`,
// And a day keyed before that reset starts again with none counted
export const computeInvestigationDay = (day: InvestigationDay, now: Temporal.Instant): InvestigationDay =>
  day.dayKey !== undefined && Temporal.Instant.compare(day.dayKey, computeLastDailyReset(now)) >= 0
    ? day
    : { count: 0, dayKey: undefined };
