import { MINING_OUTCROP_REFRESH_TIME } from "#src/services/leyLine/constants";
import { GAME_TIME_ZONE } from "#src/services/originalResin/constants";

// The moment a mined mining outcrop is back: the next day's draw at the refresh time strictly after the mining, read in
// The game's time zone. A mining outcrop mined before a day's draw is back at that draw, and one mined after it at the
// Next
export const computeMiningOutcropRespawn = (minedAt: Temporal.Instant): Temporal.Instant => {
  const minedAtZoned = minedAt.toZonedDateTimeISO(GAME_TIME_ZONE);
  const dayRefresh = minedAtZoned
    .toPlainDate()
    .toZonedDateTime({ plainTime: MINING_OUTCROP_REFRESH_TIME, timeZone: GAME_TIME_ZONE });
  const isRefreshAhead = Temporal.ZonedDateTime.compare(dayRefresh, minedAtZoned) > 0;
  const respawn = isRefreshAhead ? dayRefresh : dayRefresh.add({ days: 1 });
  return respawn.toInstant();
};
