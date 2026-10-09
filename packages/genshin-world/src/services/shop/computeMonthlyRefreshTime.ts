import { GAME_DAY_START_HOUR, GAME_TIME_ZONE } from "#src/services/originalResin/constants";
import { MONTHLY_REFRESH_DAY_OF_MONTH } from "#src/services/shop/constants";

// The monthly refresh at or before `now`: the first of the month at the game's daily hour, read in the game's time zone.
// The game day is counted from that hour, so a moment before the hour on the first still belongs to the month before
export const computeMonthlyRefreshTime = (now: Temporal.Instant): Temporal.Instant => {
  const gameDay = now.toZonedDateTimeISO(GAME_TIME_ZONE).subtract({ hours: GAME_DAY_START_HOUR }).toPlainDate();
  const monthRefreshDay = gameDay.with({ day: MONTHLY_REFRESH_DAY_OF_MONTH });
  return monthRefreshDay
    .toZonedDateTime({ plainTime: Temporal.PlainTime.from({ hour: GAME_DAY_START_HOUR }), timeZone: GAME_TIME_ZONE })
    .toInstant();
};
