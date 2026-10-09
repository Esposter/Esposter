import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { checkIsGcgIndexSelection } from "#src/services/gcg/checkIsGcgIndexSelection";
import { rollGcgDice } from "#src/services/gcg/rollGcgDice";
import { runGcgActionPhase } from "#src/services/gcg/runGcgActionPhase";
import { takeOne } from "@esposter/shared";

// A side's one reroll of its dice in the roll phase: any dice it names are thrown again, and none named passes. Once both
// Sides have rolled, the action phase opens with the round's first side
export const rerollGcgDice = (
  duel: GcgDuel,
  sideIndex: number,
  diceIndices: number[],
  random: () => number,
): GcgActionResult => {
  if (duel.phase !== GcgPhase.Roll) return GcgActionResult.WrongPhase;
  const side = takeOne(duel.sides, sideIndex);
  if (side.hasRolled) return GcgActionResult.WrongPhase;
  else if (!checkIsGcgIndexSelection(diceIndices, side.dice.length)) return GcgActionResult.Unavailable;
  const rerolledFaces = rollGcgDice(diceIndices.length, random);
  side.dice = side.dice.map((face, index) => {
    const position = diceIndices.indexOf(index);
    return position === -1 ? face : takeOne(rerolledFaces, position);
  });
  side.hasRolled = true;
  if (duel.sides.every((rolledSide) => rolledSide.hasRolled)) {
    duel.phase = GcgPhase.Action;
    duel.actingSideIndex = duel.firstSideIndex;
    runGcgActionPhase(duel);
  }
  return GcgActionResult.Done;
};
