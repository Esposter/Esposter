import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { applyGcgDamage } from "#src/services/gcg/applyGcgDamage";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { listGcgFieldCards } from "#src/services/gcg/effects/listGcgFieldCards";
import { pruneGcgZoneCards } from "#src/services/gcg/pruneGcgZoneCards";
import { takeOne } from "@esposter/shared";

// The switch itself, with no die paid and no turn passed: the character at characterIndex on a side becomes its active one,
// Each card on the field then hears the switch, and the damage it deals after it is dealt. The combat switch and a card that
// Switches a character in when played both take this path, so a switch to the active character is no switch at all
export const switchGcgActiveCharacter = (duel: GcgDuel, sideIndex: number, characterIndex: number): void => {
  const side = takeOne(duel.sides, sideIndex);
  if (characterIndex === side.activeIndex) return;
  side.activeIndex = characterIndex;
  for (const zoneCard of listGcgFieldCards(side, undefined)) {
    const damage = GcgCardIdModuleMap.get(zoneCard.cardId)?.onSwitch?.({ duel, sideIndex }, zoneCard);
    if (damage) applyGcgDamage(duel, sideIndex, damage, duel.rule);
  }
  for (const sideState of duel.sides) pruneGcgZoneCards(sideState);
};
