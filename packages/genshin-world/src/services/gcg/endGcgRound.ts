import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgRule } from "#src/models/gcg/GcgRule";

import { GcgOutcome } from "#src/models/gcg/GcgOutcome";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { drawGcgCards } from "#src/services/gcg/drawGcgCards";
import { GCG_ROUND_LIMIT } from "#src/services/gcg/constants";
import { startGcgRound } from "#src/services/gcg/startGcgRound";
import { takeOne } from "@esposter/shared";

// The end phase once both sides have declared their round's end: a Frozen status lapses, each side draws its cards from
// The first side on, and the next round begins with its roll, the side that declared first going first. The fifteenth
// Round's end concedes the duel to both sides
export const endGcgRound = (duel: GcgDuel, rule: GcgRule, random: () => number): void => {
  for (const side of duel.sides) {
    for (const character of side.characters) character.isFrozen = false;
    side.dice = [];
    side.hasDeclaredEnd = false;
  }
  for (const sideIndex of [duel.firstSideIndex, 1 - duel.firstSideIndex])
    drawGcgCards(takeOne(duel.sides, sideIndex), rule.drawCount, rule.handCardLimit);
  if (duel.round >= GCG_ROUND_LIMIT) {
    duel.phase = GcgPhase.Ended;
    duel.outcome = GcgOutcome.Conceded;
    duel.winnerSideIndex = undefined;
    return;
  }
  duel.round += 1;
  duel.firstSideIndex = duel.nextFirstSideIndex;
  startGcgRound(duel, random);
};
