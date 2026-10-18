import type { Outcrop } from "#src/models/leyLine/Outcrop";
import type { OutcropRegion } from "#src/models/leyLine/OutcropRegion";

import { OutcropStage } from "#src/models/leyLine/OutcropStage";
import { computeOutcropKindOpen } from "#src/services/leyLine/computeOutcropKindOpen";
import { drawOutcropPlace } from "#src/services/leyLine/drawOutcropPlace";

// The outcrops a daily reset starts over: each kind open at this Adventure Rank with its nations unlocked waits at a place
// Drawn afresh, and a kind with no place to draw starts none. The reset discards whatever stood before
export const computeDailyOutcrops = (
  region: OutcropRegion,
  adventureRank: number,
  unlockedCityIds: number[],
  random: () => number,
): Outcrop[] =>
  region.kinds.flatMap((kindRule) => {
    if (!computeOutcropKindOpen(kindRule, adventureRank, unlockedCityIds)) return [];
    const placeId = drawOutcropPlace(region, random);
    return placeId === undefined ? [] : [{ kind: kindRule.kind, placeId, stage: OutcropStage.Waiting }];
  });
