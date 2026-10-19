import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { applyGcgDamage } from "#src/services/gcg/applyGcgDamage";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { pruneGcgZoneCards } from "#src/services/gcg/pruneGcgZoneCards";
import { takeOne } from "@esposter/shared";

// The switch itself, with no die paid and no turn passed: the character at characterIndex on a side becomes its active
// One, switched in, so its next Normal Attack this round is a Plunging Attack. Each card on the field then hears the
// Switch, named with the character it is attached to, and the damage it deals after it is dealt. Every switch takes
// This path, a combat switch and a card's or an effect's alike, so a switch to the active character is no switch at
// All. A defeat's replacement does not, since it names the new active character without flagging it. An effect's switch
// Counts as one provisionally, as the wiki's Plunging Attack page, the open-world action, does not settle the TCG case
export const switchGcgActiveCharacter = (duel: GcgDuel, sideIndex: number, characterIndex: number): void => {
  const side = takeOne(duel.sides, sideIndex);
  if (characterIndex === side.activeIndex) return;
  side.activeIndex = characterIndex;
  takeOne(side.characters, characterIndex).isSwitchedIn = true;
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
  for (const sideIndex of duel.sides.keys()) pruneGcgZoneCards(duel, sideIndex);
};
