import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgRule } from "#src/models/gcg/GcgRule";

import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { checkGcgActingSide } from "#src/services/gcg/checkGcgActingSide";
import { endGcgRound } from "#src/services/gcg/endGcgRound";
import { takeOne } from "@esposter/shared";

// A combat action: the acting side declares its round over. The side that declares first goes first next round, and once
// Both have declared the end phase closes the round. Until then the other side keeps taking its turns
export const declareGcgRoundEnd = (
  duel: GcgDuel,
  sideIndex: number,
  rule: GcgRule,
  random: () => number,
): GcgActionResult => {
  const refusal = checkGcgActingSide(duel, sideIndex);
  if (refusal !== undefined) return refusal;
  const otherSideIndex = 1 - sideIndex;
  takeOne(duel.sides, sideIndex).hasDeclaredEnd = true;
  if (!takeOne(duel.sides, otherSideIndex).hasDeclaredEnd) duel.nextFirstSideIndex = sideIndex;
  if (takeOne(duel.sides, otherSideIndex).hasDeclaredEnd) endGcgRound(duel, rule, random);
  else duel.actingSideIndex = otherSideIndex;
  return GcgActionResult.Done;
};
