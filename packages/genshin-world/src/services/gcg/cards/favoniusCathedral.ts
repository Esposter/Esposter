import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { healGcgCharacter } from "#src/services/gcg/effects/healGcgCharacter";
import { takeOne } from "@esposter/shared";

// Favonius Cathedral: at the end phase the active character heals for two HP, for two usages
export const favoniusCathedral: GcgCardModule = {
  initialUsages: 2,
  onEndPhase: ({ duel, sideIndex }, zoneCard) => {
    const side = takeOne(duel.sides, sideIndex);
    const character = side.characters.at(side.activeIndex);
    if (character) healGcgCharacter(character, 2);
    zoneCard.usages -= 1;
  },
};
