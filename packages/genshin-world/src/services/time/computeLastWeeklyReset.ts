import { computeLastDailyReset } from "#src/services/time/computeLastDailyReset";
import { DAYS_IN_WEEK, GAME_TIME_ZONE, WEEKLY_RESET_DAY_OF_WEEK } from "#src/services/time/constants";

// The weekly reset at or before `now`, the server's 04:00 on the Monday that starts the week `now` falls in
export const computeLastWeeklyReset = (now: Temporal.Instant): Temporal.Instant => {
  const dailyReset = computeLastDailyReset(now).toZonedDateTimeISO(GAME_TIME_ZONE);
  const daysSinceWeeklyReset = (dailyReset.dayOfWeek - WEEKLY_RESET_DAY_OF_WEEK + DAYS_IN_WEEK) % DAYS_IN_WEEK;
  return dailyReset.subtract({ days: daysSinceWeeklyReset }).toInstant();
};
