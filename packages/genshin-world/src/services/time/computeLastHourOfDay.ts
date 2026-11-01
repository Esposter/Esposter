import { GAME_TIME_ZONE } from "#src/services/time/constants";

// The last `hour` o'clock on the game's clock at or before `now`: `now` less that many hours falls on a date, and that
// Date opens at the hour
export const computeLastHourOfDay = (now: Temporal.Instant, hour: number): Temporal.ZonedDateTime =>
  now
    .toZonedDateTimeISO(GAME_TIME_ZONE)
    .subtract({ hours: hour })
    .toPlainDate()
    .toZonedDateTime({ plainTime: Temporal.PlainTime.from({ hour }), timeZone: GAME_TIME_ZONE });
