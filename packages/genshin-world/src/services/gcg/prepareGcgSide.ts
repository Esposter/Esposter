import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { checkIsGcgIndexSelection } from "#src/services/gcg/checkIsGcgIndexSelection";
import { shuffleGcgCards } from "#src/services/gcg/shuffleGcgCards";
import { startGcgRound } from "#src/services/gcg/startGcgRound";
import { takeOne } from "@esposter/shared";

// A side's preparation: the cards it switches out of its hand go back into its draw pile, which is shuffled and drawn
// From to refill the hand as many cards as it gave back, and the character it chooses as its active one. The first round
// Starts once both sides have prepared
export const prepareGcgSide = (
  duel: GcgDuel,
  sideIndex: number,
  switchedHandIndices: number[],
  activeIndex: number,
  random: () => number,
): GcgActionResult => {
  if (duel.phase !== GcgPhase.Preparation) return GcgActionResult.WrongPhase;
  const side = takeOne(duel.sides, sideIndex);
  const activeCharacter = side.characters.at(activeIndex);
  if (side.hasPrepared) return GcgActionResult.WrongPhase;
  else if (!activeCharacter || activeCharacter.hp <= 0) return GcgActionResult.Unavailable;
  else if (!checkIsGcgIndexSelection(switchedHandIndices, side.hand.length)) return GcgActionResult.Unavailable;
  const switchedCards = side.hand.filter((_card, index) => switchedHandIndices.includes(index));
  side.hand = side.hand.filter((_card, index) => !switchedHandIndices.includes(index));
  side.drawPile = shuffleGcgCards([...side.drawPile, ...switchedCards], random);
  side.hand.push(...side.drawPile.slice(0, switchedCards.length));
  side.drawPile = side.drawPile.toSpliced(0, switchedCards.length);
  side.activeIndex = activeIndex;
  side.hasPrepared = true;
  if (duel.sides.every((preparedSide) => preparedSide.hasPrepared)) startGcgRound(duel, random);
  return GcgActionResult.Done;
};
