import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { takeOne } from "@esposter/shared";

const LIU_SU_ID = 322_012;
const LIU_SU_USES = 2;

// Liu Su, a companion: after a switch, the character switched to gains 1 Energy if she has none, once per Round and twice per
// match (the wiki's Liu Su (Support Card))
export const liuSu: GcgCardModule = {
  initialUsages: LIU_SU_USES,
  onSwitch: ({ duel, sideIndex }, zoneCard) => {
    const side = takeOne(duel.sides, sideIndex);
    if (zoneCard.usages <= 0 || side.usedCardIds.includes(LIU_SU_ID)) return;
    const character = takeOne(side.characters, side.activeIndex);
    if (character.energy > 0) return;
    character.energy = Math.min(character.character.maxEnergy, character.energy + 1);
    side.usedCardIds.push(LIU_SU_ID);
    zoneCard.usages -= 1;
  },
};
