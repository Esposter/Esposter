import type { Outcrop } from "#src/models/leyLine/Outcrop";
import type { OutcropKindRule } from "#src/models/leyLine/OutcropKindRule";
import type { OutcropPlacement } from "#src/models/leyLine/OutcropPlacement";

import { OutcropStage } from "#src/models/leyLine/OutcropStage";
import { computeOutcropKindOpen } from "#src/services/leyLine/computeOutcropKindOpen";
import { drawPlaceIds } from "#src/services/leyLine/drawPlaceIds";
import { takeOne } from "@esposter/shared";

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
  const openKindRules = kindRules.filter((kindRule) =>
    computeOutcropKindOpen(kindRule, adventureRank, unlockedCityIds),
  );
  const placeIds = drawPlaceIds(
    placements.map(({ id }) => id),
    openKindRules.length,
    random,
  );
  return placeIds.map((placeId, index) => ({
    kind: takeOne(openKindRules, index).kind,
    placeId,
    stage: OutcropStage.Waiting,
  }));
};
