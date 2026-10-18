import { DAILY_RESET_TIME } from "#src/services/enemy/constants";

// The daily reset at or before `now`, read in its time zone: the reset of `now`'s own day at the daily reset's hour, or
// The day before's when `now` is earlier than it
export const computeDailyResetTime = (now: Temporal.ZonedDateTime): Temporal.ZonedDateTime => {
  const todayReset = now.toPlainDate().toZonedDateTime({ plainTime: DAILY_RESET_TIME, timeZone: now.timeZoneId });
  return Temporal.ZonedDateTime.compare(todayReset, now) > 0 ? todayReset.subtract({ days: 1 }) : todayReset;
};
