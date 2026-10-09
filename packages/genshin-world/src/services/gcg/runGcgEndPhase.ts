import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { listGcgFieldCards } from "#src/services/gcg/effects/listGcgFieldCards";
import { applyGcgDamage } from "#src/services/gcg/applyGcgDamage";
import { pruneGcgZoneCards } from "#src/services/gcg/pruneGcgZoneCards";

// Runs the end-phase hooks of the cards on the field, the first side first, then ages every card that lasts rounds by one,
// And takes off the cards those hooks and the ageing spent
export const runGcgEndPhase = (duel: GcgDuel): void => {
  for (const [sideIndex, side] of duel.sides.entries())
    for (const zoneCard of listGcgFieldCards(side, undefined)) {
      const damage = GcgCardIdModuleMap.get(zoneCard.cardId)?.onEndPhase?.({ duel, sideIndex }, zoneCard);
      if (damage) applyGcgDamage(duel, sideIndex, damage, duel.rule);
    }
  for (const side of duel.sides)
    for (const zoneCard of listGcgFieldCards(side, undefined))
      if (GcgCardIdModuleMap.get(zoneCard.cardId)?.initialRounds !== undefined && zoneCard.rounds > 0)
        zoneCard.rounds -= 1;
  for (const side of duel.sides) pruneGcgZoneCards(side);
};
