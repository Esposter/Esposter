import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { takeOne } from "@esposter/shared";

// Starsigns: the active character gains one energy
export const starsigns: GcgCardModule = {
  play: ({ duel, sideIndex }) => {
    const character = takeOne(duel.sides, sideIndex).characters.at(takeOne(duel.sides, sideIndex).activeIndex);
    if (character) character.energy = Math.min(character.character.maxEnergy, character.energy + 1);
  },
};
