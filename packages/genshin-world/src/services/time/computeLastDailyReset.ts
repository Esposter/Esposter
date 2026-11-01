import { computeLastHourOfDay } from "#src/services/time/computeLastHourOfDay";
import { GAME_DAY_START_HOUR } from "#src/services/time/constants";

// The daily reset at or before `now`, the server's 04:00 on the game day `now` falls in
export const computeLastDailyReset = (now: Temporal.Instant): Temporal.Instant =>
  computeLastHourOfDay(now, GAME_DAY_START_HOUR).toInstant();
