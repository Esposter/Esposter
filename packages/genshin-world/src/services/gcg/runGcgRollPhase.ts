import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { listGcgFieldCards } from "#src/services/gcg/effects/listGcgFieldCards";

// Runs the roll-phase hooks of every card each side has on the field, the first side first, once its dice are rolled
export const runGcgRollPhase = (duel: GcgDuel): void => {
  for (const [sideIndex, side] of duel.sides.entries())
    for (const zoneCard of listGcgFieldCards(side, undefined))
      GcgCardIdModuleMap.get(zoneCard.cardId)?.onRollPhase?.({ duel, sideIndex }, zoneCard);
};
