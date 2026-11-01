import { computeNextHourOfDay } from "#src/services/time/computeNextHourOfDay";
import { GAME_DAY_START_HOUR } from "#src/services/time/constants";

// The daily reset after `now`, a day after the one at or before it
export const computeNextDailyReset = (now: Temporal.Instant): Temporal.Instant =>
  computeNextHourOfDay(now, GAME_DAY_START_HOUR);
