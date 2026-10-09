import type { ImaginariumSeason } from "#src/models/imaginarium/ImaginariumSeason";

import { findLatestBegun } from "#src/services/shared/findLatestBegun";

// The season the Theater plays at `now`: the one that began latest before it. A season is never played before its start, and
// After the last one's end the last begun season is held, so a dump read months on plays its final season rather than none
export const findImaginariumSeason = (
  seasons: ImaginariumSeason[],
  now: Temporal.Instant,
): ImaginariumSeason | undefined => findLatestBegun(seasons, ({ beginsAt }) => beginsAt, now);
