import { computeDailyResetTime } from "#src/services/commission/computeDailyResetTime";

// Whether a day dealt at `dealtAt` is still the day at `now`: dealt at or after the daily reset at or before `now`, so a
// Day dealt before that reset is dealt again
export const checkIsCommissionDayCurrent = (dealtAt: Temporal.Instant, now: Temporal.ZonedDateTime): boolean =>
  Temporal.Instant.compare(dealtAt, computeDailyResetTime(now).toInstant()) >= 0;
