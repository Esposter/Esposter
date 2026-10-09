import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { findGcgAdjacentCharacterIndex } from "#src/services/gcg/findGcgAdjacentCharacterIndex";
import { takeOne } from "@esposter/shared";

// Forcibly switches the opposing active character to the standing one a step away, forward or back round its side, when one
// Stands. The switch costs the target no die and takes no turn
export const switchGcgOpposingActive = (duel: GcgDuel, sideIndex: number, step: -1 | 1): void => {
  const targetSide = takeOne(duel.sides, 1 - sideIndex);
  const nextIndex = findGcgAdjacentCharacterIndex(targetSide, targetSide.activeIndex, step);
  if (nextIndex !== undefined) targetSide.activeIndex = nextIndex;
};
