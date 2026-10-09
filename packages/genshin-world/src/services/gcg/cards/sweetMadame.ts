import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { canEatGcgFood } from "#src/services/gcg/effects/canEatGcgFood";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { healGcgCharacter } from "#src/services/gcg/effects/healGcgCharacter";
import { takeOne } from "@esposter/shared";

const SWEET_MADAME_ID = 333_005;

// Sweet Madame: the target character heals for one HP, and holds the food as a status until the round ends, so it eats no
// Other food this round
export const sweetMadame: GcgCardModule = {
  canPlay: ({ duel, sideIndex }, targetIndex) => canEatGcgFood(duel, sideIndex, targetIndex),
  initialRounds: 1,
  play: ({ duel, sideIndex }, targetIndex) => {
    const character = targetIndex === undefined ? undefined : takeOne(duel.sides, sideIndex).characters.at(targetIndex);
    if (!character) return;
    healGcgCharacter(character, 1);
    character.statuses.push(createGcgZoneCard(SWEET_MADAME_ID, sweetMadame));
  },
};
