import type { InvestigationDay } from "#src/models/investigation/InvestigationDay";

import { checkIsDailyResetDayCurrent } from "#src/services/time/checkIsDailyResetDayCurrent";

// The game day's investigations at `now`: the day kept while its key is at or after the daily reset at or before `now`,
// And a day keyed before that reset starts again with none counted
export const computeInvestigationDay = (day: InvestigationDay, now: Temporal.Instant): InvestigationDay =>
  day.dayKey !== undefined && checkIsDailyResetDayCurrent(day.dayKey, now) ? day : { count: 0, dayKey: undefined };
