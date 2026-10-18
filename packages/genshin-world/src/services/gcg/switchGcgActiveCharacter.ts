import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { applyGcgDamage } from "#src/services/gcg/applyGcgDamage";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { pruneGcgZoneCards } from "#src/services/gcg/pruneGcgZoneCards";
import { takeOne } from "@esposter/shared";

// The switch itself, with no die paid and no turn passed: the character at characterIndex on a side becomes its active one,
// Each card on the field then hears the switch, named with the character it is attached to, and the damage it deals after
// it is dealt. The combat switch and a card that
// Switches a character in when played both take this path, so a switch to the active character is no switch at all
export const switchGcgActiveCharacter = (duel: GcgDuel, sideIndex: number, characterIndex: number): void => {
  const side = takeOne(duel.sides, sideIndex);
  if (characterIndex === side.activeIndex) return;
  side.activeIndex = characterIndex;
  const heard = [
    ...side.characters.flatMap((character, index) =>
      [...character.equipments, ...character.statuses].map((zoneCard) => ({ characterIndex: index, zoneCard })),
    ),
    ...[...side.supports, ...side.summons, ...side.onstages].map((zoneCard) => ({
      characterIndex: undefined,
      zoneCard,
    })),
  ];
  for (const { characterIndex: attachedIndex, zoneCard } of heard) {
    const damage = GcgCardIdModuleMap.get(zoneCard.cardId)?.onSwitch?.(
      { characterIndex: attachedIndex, duel, sideIndex },
      zoneCard,
    );
    if (damage) applyGcgDamage(duel, sideIndex, damage, duel.rule);
  }
  for (const sideState of duel.sides) pruneGcgZoneCards(sideState);
};
