import type { GatheringPlace } from "#src/models/gathering/GatheringPlace";

import { checkIsMiningOutcropStanding } from "#src/services/leyLine/checkIsMiningOutcropStanding";
import { checkIsOutcropDayCurrent } from "#src/services/leyLine/checkIsOutcropDayCurrent";

// The mining outcrop places standing at `now`: a region's day's draw, made at its reset, holds its places until the next
// Reset, and a place mined since stands again only from its respawn. A draw from a day before this one stands nowhere
export const computeStandingMiningOutcrops = (
  places: readonly GatheringPlace[],
  drawn: { at: Temporal.Instant; placeIds: readonly string[] } | undefined,
  minedAtMap: ReadonlyMap<string, Temporal.Instant>,
  now: Temporal.Instant,
): GatheringPlace[] => {
  if (drawn === undefined || !checkIsOutcropDayCurrent(drawn.at, now)) return [];
  return places.filter(
    ({ id }) => drawn.placeIds.includes(id) && checkIsMiningOutcropStanding(minedAtMap.get(id), now),
  );
};
