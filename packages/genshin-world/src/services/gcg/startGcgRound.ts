import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GCG_DICE_COUNT } from "#src/services/gcg/constants";
import { rollGcgDice } from "#src/services/gcg/rollGcgDice";
import { runGcgRollPhase } from "#src/services/gcg/runGcgRollPhase";

// Opens a round's roll phase: each side throws its dice, and the phase waits on each side's one reroll
export const startGcgRound = (duel: GcgDuel, random: () => number): void => {
  for (const side of duel.sides) {
    side.dice = rollGcgDice(GCG_DICE_COUNT, random);
    side.hasRolled = false;
  }
  runGcgRollPhase(duel);
  duel.phase = GcgPhase.Roll;
};
