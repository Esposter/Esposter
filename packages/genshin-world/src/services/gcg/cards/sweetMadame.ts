import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { checkIsGcgFoodEatable } from "#src/services/gcg/effects/checkIsGcgFoodEatable";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { healGcgCharacter } from "#src/services/gcg/effects/healGcgCharacter";
import { takeOne } from "@esposter/shared";
import { SWEET_MADAME_ID } from "#src/services/gcg/cards/constants";

// Sweet Madame: the target character heals for one HP, and holds the food as a status until the round ends, so it eats no
// Other food this round
export const sweetMadame: GcgCardModule = {
  canPlay: ({ duel, sideIndex }, targetIndex) => checkIsGcgFoodEatable(duel, sideIndex, targetIndex),
  initialRounds: 1,
  play: ({ duel, sideIndex }, targetIndex) => {
    const character = targetIndex === undefined ? undefined : takeOne(duel.sides, sideIndex).characters.at(targetIndex);
    if (!character) return;
    healGcgCharacter(character, 1);
    character.statuses.push(createGcgZoneCard(SWEET_MADAME_ID, sweetMadame));
  },
};
