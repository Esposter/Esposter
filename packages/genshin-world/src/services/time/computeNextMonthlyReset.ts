import { GAME_TIME_ZONE } from "#src/services/time/constants";
import { computeLastMonthlyReset } from "#src/services/time/computeLastMonthlyReset";

// The monthly reset after `now`, the first of the month after the one at or before it
export const computeNextMonthlyReset = (now: Temporal.Instant): Temporal.Instant =>
  computeLastMonthlyReset(now).toZonedDateTimeISO(GAME_TIME_ZONE).add({ months: 1 }).toInstant();
