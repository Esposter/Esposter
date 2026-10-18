import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { healGcgCharacter } from "#src/services/gcg/effects/healGcgCharacter";
import { takeOne } from "@esposter/shared";

const HEAL_VALUE = 1;

// Mushroom Pizza (In Effect): at each End Phase it heals the character it is on for 1 HP, and it is spent after two End Phases
export const mushroomPizzaInEffect: GcgCardModule = {
  initialUsages: 2,
  onEndPhase: ({ characterIndex, duel, sideIndex }, zoneCard) => {
    zoneCard.usages -= 1;
    const character =
      characterIndex === undefined ? undefined : takeOne(duel.sides, sideIndex).characters.at(characterIndex);
    if (character) healGcgCharacter(character, HEAL_VALUE);
    return undefined;
  },
};
