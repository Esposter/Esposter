import { computeLastDailyReset } from "#src/services/time/computeLastDailyReset";
import { GAME_TIME_ZONE, MONTHLY_RESET_DAY_OF_MONTH } from "#src/services/time/constants";

// The monthly reset at or before `now`, the server's 04:00 on the first of the month `now` falls in
export const computeLastMonthlyReset = (now: Temporal.Instant): Temporal.Instant => {
  const dailyReset = computeLastDailyReset(now).toZonedDateTimeISO(GAME_TIME_ZONE);
  return dailyReset.subtract({ days: dailyReset.day - MONTHLY_RESET_DAY_OF_MONTH }).toInstant();
};
