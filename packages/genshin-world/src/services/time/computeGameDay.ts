import { computeLastHourOfDay } from "#src/services/time/computeLastHourOfDay";
import { GAME_DAY_START_HOUR } from "#src/services/time/constants";

// The game day `now` falls in: the date of the daily reset at or before it, read on the server's clock
export const computeGameDay = (now: Temporal.Instant): Temporal.PlainDate =>
  computeLastHourOfDay(now, GAME_DAY_START_HOUR).toPlainDate();
