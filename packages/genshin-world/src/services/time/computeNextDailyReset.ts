import { computeLastDailyReset } from "#src/services/time/computeLastDailyReset";
import { GAME_TIME_ZONE } from "#src/services/time/constants";

// The daily reset after `now`, a day after the one at or before it
export const computeNextDailyReset = (now: Temporal.Instant): Temporal.Instant =>
  computeLastDailyReset(now).toZonedDateTimeISO(GAME_TIME_ZONE).add({ days: 1 }).toInstant();
