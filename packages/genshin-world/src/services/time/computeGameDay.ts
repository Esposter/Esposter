import { GAME_DAY_START_HOUR, GAME_TIME_ZONE } from "#src/services/time/constants";

// The game day `now` falls in: the date of the daily reset at or before it, read on the server's clock
export const computeGameDay = (now: Temporal.Instant): Temporal.PlainDate =>
  now.toZonedDateTimeISO(GAME_TIME_ZONE).subtract({ hours: GAME_DAY_START_HOUR }).toPlainDate();
