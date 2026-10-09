import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { listGcgFieldCards } from "#src/services/gcg/effects/listGcgFieldCards";
import { pruneGcgZoneCards } from "#src/services/gcg/pruneGcgZoneCards";
import { takeOne } from "@esposter/shared";

// Runs the action-phase hooks as the action phase begins, the round's first side's cards first, then takes off the field
// The cards those hooks spent
export const runGcgActionPhase = (duel: GcgDuel): void => {
  for (const sideIndex of [duel.firstSideIndex, 1 - duel.firstSideIndex]) {
    const side = takeOne(duel.sides, sideIndex);
    for (const zoneCard of listGcgFieldCards(side, undefined))
      GcgCardIdModuleMap.get(zoneCard.cardId)?.onActionPhase?.({ duel, sideIndex }, zoneCard);
  }
  for (const side of duel.sides) pruneGcgZoneCards(side);
};
