import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { checkGcgActingSide } from "#src/services/gcg/checkGcgActingSide";
import { checkIsGcgIndexSelection } from "#src/services/gcg/checkIsGcgIndexSelection";
import { takeOne } from "@esposter/shared";

// A fast action: the side discards a card from its hand to turn one of its dice into its active character's element. The
// Turn stays with the side
export const tuneGcgDie = (duel: GcgDuel, sideIndex: number, cardIndex: number, dieIndex: number): GcgActionResult => {
  const refusal = checkGcgActingSide(duel, sideIndex);
  if (refusal !== undefined) return refusal;
  const side = takeOne(duel.sides, sideIndex);
  const active = side.characters.at(side.activeIndex);
  if (
    !active ||
    !checkIsGcgIndexSelection([cardIndex], side.hand.length) ||
    !checkIsGcgIndexSelection([dieIndex], side.dice.length)
  )
    return GcgActionResult.Unavailable;
  side.hand = side.hand.filter((_card, index) => index !== cardIndex);
  side.dice[dieIndex] = active.character.element;
  return GcgActionResult.Done;
};
