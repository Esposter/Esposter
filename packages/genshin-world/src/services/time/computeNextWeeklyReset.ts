import { computeLastWeeklyReset } from "#src/services/time/computeLastWeeklyReset";
import { DAYS_IN_WEEK, GAME_TIME_ZONE } from "#src/services/time/constants";

// The weekly reset after `now`, the Monday a week after the one at or before it
export const computeNextWeeklyReset = (now: Temporal.Instant): Temporal.Instant =>
  computeLastWeeklyReset(now).toZonedDateTimeISO(GAME_TIME_ZONE).add({ days: DAYS_IN_WEEK }).toInstant();
