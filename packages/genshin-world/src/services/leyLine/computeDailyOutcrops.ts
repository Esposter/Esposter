import type { Outcrop } from "#src/models/leyLine/Outcrop";
import type { OutcropKindRule } from "#src/models/leyLine/OutcropKindRule";
import type { OutcropPlacement } from "#src/models/leyLine/OutcropPlacement";

import { OutcropStage } from "#src/models/leyLine/OutcropStage";
import { computeOutcropKindOpen } from "#src/services/leyLine/computeOutcropKindOpen";
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
  const outcrops: Outcrop[] = [];
  let freePlacements = placements;
  for (const kindRule of kindRules) {
    if (!computeOutcropKindOpen(kindRule, adventureRank, unlockedCityIds) || freePlacements.length === 0) continue;
    const { id } = takeOne(freePlacements, Math.floor(random() * freePlacements.length));
    freePlacements = freePlacements.filter((placement) => placement.id !== id);
    outcrops.push({ kind: kindRule.kind, placeId: id, stage: OutcropStage.Waiting });
  }
  return outcrops;
};
