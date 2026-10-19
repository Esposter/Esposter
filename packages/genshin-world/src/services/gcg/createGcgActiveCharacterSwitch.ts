import type { GcgDamage } from "#src/models/gcg/GcgDamage";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgRule } from "#src/models/gcg/GcgRule";

import { pruneGcgZoneCards } from "#src/services/gcg/pruneGcgZoneCards";
import { takeOne } from "@esposter/shared";

// The switch itself, with no die paid and no turn passed: the character at characterIndex on a side becomes its active
// One, switched in, so its next Normal Attack this round is a Plunging Attack. Each card on the field then hears the
// Switch, named with the character it is attached to, and the damage it deals after it is dealt. Every switch takes
// This path, a combat switch and a card's or an effect's alike, so a switch to the active character is no switch at
// All. A defeat's replacement does not, since it names the new active character without flagging it. An effect's switch
// Counts as one provisionally, as the wiki's Plunging Attack page, the open-world action, does not settle the TCG case.
// The damage a card deals on hearing it goes through applyDamage, handed in because dealing damage can force a switch
export const createGcgActiveCharacterSwitch =
  (applyDamage: (duel: GcgDuel, sourceSideIndex: number, damage: GcgDamage, rule: GcgRule) => void) =>
  (duel: GcgDuel, sideIndex: number, characterIndex: number): void => {
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
      const damage = duel.cardModules
        .get(zoneCard.cardId)
        ?.onSwitch?.({ characterIndex: attachedIndex, duel, sideIndex }, zoneCard);
      if (damage) applyDamage(duel, sideIndex, damage, duel.rule);
    }
    for (const prunedSideIndex of duel.sides.keys()) pruneGcgZoneCards(duel, prunedSideIndex);
  };
