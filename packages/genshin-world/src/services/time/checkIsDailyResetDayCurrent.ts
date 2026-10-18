import { computeLastDailyReset } from "#src/services/time/computeLastDailyReset";

// Whether a day keyed at `dayAt` still stands at `now`: kept if keyed at or after the daily reset at or before `now`,
// Otherwise, a day keyed before that reset is stale
export const checkIsDailyResetDayCurrent = (dayAt: Temporal.Instant, now: Temporal.Instant): boolean =>
  Temporal.Instant.compare(dayAt, computeLastDailyReset(now)) >= 0;
