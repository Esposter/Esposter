import type { AbyssPeriod } from "#src/models/spiralAbyss/AbyssPeriod";

import { GAME_TIME_ZONE } from "#src/services/originalResin/constants";

// The period of the Moon Spire that runs at `now`: the one that began latest before it. A period has no recorded end, so a
// Dump read months on keeps its last period rather than none, and undefined only when no period has begun
export const findAbyssPeriod = (periods: AbyssPeriod[], now: Temporal.Instant): AbyssPeriod | undefined =>
  periods
    .map((period) => ({
      begins: Temporal.PlainDateTime.from(period.startsAt).toZonedDateTime(GAME_TIME_ZONE).toInstant(),
      period,
    }))
    .filter(({ begins }) => Temporal.Instant.compare(begins, now) <= 0)
    .toSorted((firstBegun, secondBegun) => Temporal.Instant.compare(secondBegun.begins, firstBegun.begins))
    .at(0)?.period;
