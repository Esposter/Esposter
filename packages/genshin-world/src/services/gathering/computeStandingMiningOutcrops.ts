import type { GatheringPlace } from "#src/models/gathering/GatheringPlace";

import { checkIsMiningOutcropStanding } from "#src/services/leyLine/checkIsMiningOutcropStanding";
import { computeLastMiningOutcropDraw } from "#src/services/leyLine/computeLastMiningOutcropDraw";

// The mining outcrop places standing at `now`: a region's day's draw, made at its 06:00, holds its places until the next
// Draw, and a place mined since stands again only from its respawn. A draw from before the last 06:00 stands nowhere
export const computeStandingMiningOutcrops = (
  places: readonly GatheringPlace[],
  drawn: undefined | { at: Temporal.Instant; placeIds: readonly string[] },
  minedAtMap: ReadonlyMap<string, Temporal.Instant>,
  now: Temporal.Instant,
): GatheringPlace[] => {
  if (drawn === undefined || Temporal.Instant.compare(drawn.at, computeLastMiningOutcropDraw(now)) < 0) return [];
  return places.filter(
    ({ id }) => drawn.placeIds.includes(id) && checkIsMiningOutcropStanding(minedAtMap.get(id), now),
  );
};
