import { computeLastDailyReset } from "#src/services/time/computeLastDailyReset";

// Whether a day dealt at `dealtAt` is still the day at `now`: dealt at or after the daily reset at or before `now`, so a
// Day dealt before that reset is dealt again
export const checkIsCommissionDayCurrent = (dealtAt: Temporal.Instant, now: Temporal.Instant): boolean =>
  Temporal.Instant.compare(dealtAt, computeLastDailyReset(now)) >= 0;
