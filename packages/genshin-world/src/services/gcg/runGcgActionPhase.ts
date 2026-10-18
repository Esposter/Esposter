import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { listGcgFieldCards } from "#src/services/gcg/effects/listGcgFieldCards";
import { pruneGcgZoneCards } from "#src/services/gcg/pruneGcgZoneCards";
import { takeOne } from "@esposter/shared";

// Runs the action-phase hooks as the action phase begins, the round's first side's cards first, then takes off the field
// The cards those hooks spent. Each side's Normal Attacks are Charged Attacks this round when its Elemental Dice were even in
// Number before the phase, which is settled before any hook runs. The cards are listed before any hook runs too, so a card
// A hook moves to the other side is not run again there
export const runGcgActionPhase = (duel: GcgDuel): void => {
  const sideIndices = [duel.firstSideIndex, 1 - duel.firstSideIndex];
  for (const sideIndex of sideIndices) {
    const side = takeOne(duel.sides, sideIndex);
    side.hasChargedAttack = side.dice.length % 2 === 0;
  }
  const fieldCards = sideIndices.map((sideIndex) => ({
    sideIndex,
    zoneCards: listGcgFieldCards(takeOne(duel.sides, sideIndex), undefined),
  }));
  for (const { sideIndex, zoneCards } of fieldCards)
    for (const zoneCard of zoneCards)
      GcgCardIdModuleMap.get(zoneCard.cardId)?.onActionPhase?.({ duel, sideIndex }, zoneCard);
  for (const sideIndex of duel.sides.keys()) pruneGcgZoneCards(duel, sideIndex);
};
