import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { prepareGcgSide } from "#src/services/gcg/prepareGcgSide";
import { replaceGcgCharacter } from "#src/services/gcg/replaceGcgCharacter";
import { rerollGcgDice } from "#src/services/gcg/rerollGcgDice";
import { takeGcgScriptedAction } from "#src/services/gcg/takeGcgScriptedAction";
import { takeOne } from "@esposter/shared";

// Runs a side the player does not steer through whatever it owes the duel now: its preparation, its one reroll, a
// Replacement for a defeated active, or its turn by the scripted policy. It stops where the duel waits on the other side,
// Or where the duel has ended; each step changes the duel, so the loop ends
export const advanceGcgOpponent = (duel: GcgDuel, sideIndex: number, random: () => number): void => {
  while (duel.phase !== GcgPhase.Ended) {
    const side = takeOne(duel.sides, sideIndex);
    const standingIndex = side.characters.findIndex((character) => character.hp > 0);
    if (duel.phase === GcgPhase.Preparation) {
      if (side.hasPrepared) return;
      prepareGcgSide(duel, sideIndex, [], standingIndex, random);
    } else if (duel.phase === GcgPhase.Roll) {
      if (side.hasRolled) return;
      rerollGcgDice(duel, sideIndex, [], random);
    } else if (side.isReplacementPending) replaceGcgCharacter(duel, sideIndex, standingIndex);
    else if (duel.actingSideIndex !== sideIndex) return;
    else if (takeGcgScriptedAction(duel, sideIndex, random) !== GcgActionResult.Done) return;
  }
};
