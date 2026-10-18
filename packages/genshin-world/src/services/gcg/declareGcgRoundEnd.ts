import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgRule } from "#src/models/gcg/GcgRule";

import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { checkGcgActingSide } from "#src/services/gcg/checkGcgActingSide";
import { endGcgRound } from "#src/services/gcg/endGcgRound";
import { runGcgSideDamageHook } from "#src/services/gcg/runGcgSideDamageHook";
import { takeOne } from "@esposter/shared";

// A combat action: the acting side declares its round over, after what its cards deal on the declaration. The side that
// Declares first goes first next round, and once both have declared the end phase closes the round. Until then the other side
// Keeps taking its turns, each beginning with what its cards deal before the choice
export const declareGcgRoundEnd = (duel: GcgDuel, sideIndex: number, rule: GcgRule): GcgActionResult => {
  const refusal = checkGcgActingSide(duel, sideIndex);
  if (refusal !== undefined) return refusal;
  runGcgSideDamageHook(duel, sideIndex, "onRoundEndDeclared");
  if (duel.phase === GcgPhase.Ended) return GcgActionResult.Done;
  const otherSideIndex = 1 - sideIndex;
  takeOne(duel.sides, sideIndex).hasDeclaredEnd = true;
  if (!takeOne(duel.sides, otherSideIndex).hasDeclaredEnd) duel.nextFirstSideIndex = sideIndex;
  if (takeOne(duel.sides, otherSideIndex).hasDeclaredEnd) endGcgRound(duel, rule);
  else {
    duel.actingSideIndex = otherSideIndex;
    runGcgSideDamageHook(duel, otherSideIndex, "onBeforeAction");
  }
  return GcgActionResult.Done;
};
