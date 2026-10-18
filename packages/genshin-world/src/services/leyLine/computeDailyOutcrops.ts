import type { Outcrop } from "#src/models/leyLine/Outcrop";
import type { OutcropKindRule } from "#src/models/leyLine/OutcropKindRule";
import type { OutcropPlacement } from "#src/models/leyLine/OutcropPlacement";

import { OutcropStage } from "#src/models/leyLine/OutcropStage";
import { computeOutcropKindOpen } from "#src/services/leyLine/computeOutcropKindOpen";
import { drawPlaceIds } from "#src/services/leyLine/drawPlaceIds";

// The outcrops a daily reset starts over: each kind open at this Adventure Rank with its nations unlocked waits at a
// Fitted place drawn afresh from the places no kind before it holds, and a kind with no place left starts none. The
// Reset discards whatever stood before
export const computeDailyOutcrops = (
  kindRules: OutcropKindRule[],
  placements: OutcropPlacement[],
  adventureRank: number,
  unlockedCityIds: number[],
  random: () => number,
): Outcrop[] => {
  const outcrops: Outcrop[] = [];
  let freeIds = placements.map(({ id }) => id);
  for (const kindRule of kindRules) {
    if (!computeOutcropKindOpen(kindRule, adventureRank, unlockedCityIds) || freeIds.length === 0) continue;
    const [placeId] = drawPlaceIds(freeIds, 1, random);
    freeIds = freeIds.filter((id) => id !== placeId);
    outcrops.push({ kind: kindRule.kind, placeId, stage: OutcropStage.Waiting });
  }
  return outcrops;
};
