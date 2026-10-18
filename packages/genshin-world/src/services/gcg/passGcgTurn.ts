import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { runGcgSideDamageHook } from "#src/services/gcg/runGcgSideDamageHook";
import { takeOne } from "@esposter/shared";

// Passes the turn after a combat action to the other side, unless it has declared its round's end: the side still acting
// Then acts on. The side that takes the turn deals what its cards deal before its choice
export const passGcgTurn = (duel: GcgDuel, sideIndex: number): void => {
  const otherSideIndex = 1 - sideIndex;
  if (!takeOne(duel.sides, otherSideIndex).hasDeclaredEnd) duel.actingSideIndex = otherSideIndex;
  runGcgSideDamageHook(duel, duel.actingSideIndex, "onBeforeAction");
};
