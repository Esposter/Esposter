import { computeGameDay } from "#src/services/time/computeGameDay";
import { GAME_DAY_START_HOUR, GAME_TIME_ZONE } from "#src/services/time/constants";

// The daily reset at or before `now`, the server's 04:00 on the game day `now` falls in
export const computeLastDailyReset = (now: Temporal.Instant): Temporal.Instant =>
  computeGameDay(now)
    .toZonedDateTime({ plainTime: Temporal.PlainTime.from({ hour: GAME_DAY_START_HOUR }), timeZone: GAME_TIME_ZONE })
    .toInstant();
