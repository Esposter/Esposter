import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { runGcgPreparedSkills } from "#src/services/gcg/runGcgPreparedSkills";
import { runGcgSideDamageHook } from "#src/services/gcg/runGcgSideDamageHook";
import { takeOne } from "@esposter/shared";

// Passes the turn after a combat action to the other side, unless it has declared its round's end: the side still acting
// Then acts on, with no new turn begun, so its prepared skills wait for the turn it next takes. The side that takes the turn
// Runs the skills prepared for it, then deals what its cards deal before its choice
export const passGcgTurn = (duel: GcgDuel, sideIndex: number): void => {
  const otherSideIndex = 1 - sideIndex;
  if (!takeOne(duel.sides, otherSideIndex).hasDeclaredEnd) {
    duel.actingSideIndex = otherSideIndex;
    runGcgPreparedSkills(duel, otherSideIndex);
  }
  runGcgSideDamageHook(duel, duel.actingSideIndex, "onBeforeAction");
};
