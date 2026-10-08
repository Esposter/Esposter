import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { takeOne } from "@esposter/shared";

// Passes the turn after a combat action to the other side, unless it has declared its round's end: the side still acting
// Then acts on
export const passGcgTurn = (duel: GcgDuel, sideIndex: number): void => {
  const otherSideIndex = 1 - sideIndex;
  if (!takeOne(duel.sides, otherSideIndex).hasDeclaredEnd) duel.actingSideIndex = otherSideIndex;
};
