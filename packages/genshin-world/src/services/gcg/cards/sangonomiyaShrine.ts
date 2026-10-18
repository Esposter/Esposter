import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { healGcgCharacter } from "#src/services/gcg/effects/healGcgCharacter";
import { takeOne } from "@esposter/shared";

const SANGONOMIYA_SHRINE_USAGES = 2;
const SANGONOMIYA_SHRINE_HEAL = 1;

// Sangonomiya Shrine, a Support: at each End Phase every character of its side heals 1 HP, for 2 usages
export const sangonomiyaShrine: GcgCardModule = {
  initialUsages: SANGONOMIYA_SHRINE_USAGES,
  onEndPhase: ({ duel, sideIndex }, zoneCard) => {
    for (const character of takeOne(duel.sides, sideIndex).characters)
      healGcgCharacter(character, SANGONOMIYA_SHRINE_HEAL);
    zoneCard.usages -= 1;
    return undefined;
  },
};
