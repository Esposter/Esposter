import { DAILY_RESET_TIME } from "#src/services/enemy/constants";
import { WEEKLY_RESET_DAY_OF_WEEK } from "#src/services/weekly/constants";

// The weekly reset at or before `now`, read in its time zone: the Monday at the daily reset's hour. A weekly count
// Starts again there, so a moment before this week's reset belongs to the week before
export const computeWeeklyResetTime = (now: Temporal.ZonedDateTime): Temporal.ZonedDateTime => {
  const daysSinceReset = (now.dayOfWeek - WEEKLY_RESET_DAY_OF_WEEK + 7) % 7;
  const thisWeekReset = now
    .toPlainDate()
    .subtract({ days: daysSinceReset })
    .toZonedDateTime({ plainTime: DAILY_RESET_TIME, timeZone: now.timeZoneId });
  return Temporal.ZonedDateTime.compare(thisWeekReset, now) > 0 ? thisWeekReset.subtract({ weeks: 1 }) : thisWeekReset;
};
