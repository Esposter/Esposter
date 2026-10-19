import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { PYRO_SCORPION_ID } from "#src/services/gcg/cards/constants";
import { takeOne } from "@esposter/shared";

// Adds a Pyro Scorpion to a side's hand, which a full hand takes no card into
export const addPyroScorpionToHand = (duel: GcgDuel, sideIndex: number): void => {
  const side = takeOne(duel.sides, sideIndex);
  if (side.hand.length < duel.rule.handCardLimit) side.hand.push(PYRO_SCORPION_ID);
};
