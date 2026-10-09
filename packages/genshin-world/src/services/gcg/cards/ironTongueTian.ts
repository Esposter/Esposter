import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { takeOne } from "@esposter/shared";

// Iron Tongue Tian: at the end phase a standing character without maximum Energy gains one Energy, the active character
// First, for two usages
export const ironTongueTian: GcgCardModule = {
  initialUsages: 2,
  onEndPhase: ({ duel, sideIndex }, zoneCard) => {
    const side = takeOne(duel.sides, sideIndex);
    const characterIndices = [side.activeIndex, ...side.characters.map((_character, index) => index)];
    const character = characterIndices
      .map((index) => side.characters.at(index))
      .find((candidate) => candidate && candidate.hp > 0 && candidate.energy < candidate.character.maxEnergy);
    if (character) character.energy += 1;
    zoneCard.usages -= 1;
  },
};
