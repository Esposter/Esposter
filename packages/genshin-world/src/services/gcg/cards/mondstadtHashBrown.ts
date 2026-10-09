import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { healGcgCharacter } from "#src/services/gcg/effects/healGcgCharacter";
import { takeOne } from "@esposter/shared";

const MONDSTADT_HASH_BROWN_ID = 333_006;

// Mondstadt Hash Brown: the target character heals for two HP, and at most one food is eaten a round
export const mondstadtHashBrown: GcgCardModule = {
  canPlay: ({ duel, sideIndex }, targetIndex) =>
    targetIndex !== undefined &&
    takeOne(duel.sides, sideIndex).characters.at(targetIndex) !== undefined &&
    !takeOne(duel.sides, sideIndex).usedCardIds.includes(MONDSTADT_HASH_BROWN_ID),
  play: ({ duel, sideIndex }, targetIndex) => {
    const side = takeOne(duel.sides, sideIndex);
    side.usedCardIds.push(MONDSTADT_HASH_BROWN_ID);
    const character = targetIndex === undefined ? undefined : side.characters.at(targetIndex);
    if (character) healGcgCharacter(character, 2);
  },
};
