import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { addGcgZoneCardToCharacter } from "#src/services/gcg/effects/addGcgZoneCardToCharacter";
import { checkIsGcgFoodEatable } from "#src/services/gcg/effects/checkIsGcgFoodEatable";

const LOTUS_FLOWER_CRISP_ID = 333_003;
const DAMAGE_REDUCTION = 3;

// Lotus Flower Crisp, a food: the target character takes 3 less DMG the next time, and the food is held as a status until the
// Round ends, so the character eats no other food this round
export const lotusFlowerCrisp: GcgCardModule = {
  canPlay: ({ duel, sideIndex }, targetIndex) => checkIsGcgFoodEatable(duel, sideIndex, targetIndex),
  initialRounds: 1,
  initialUsages: 1,
  modifyDamageReceived: (_context, value, zoneCard) => {
    zoneCard.usages -= 1;
    return Math.max(0, value - DAMAGE_REDUCTION);
  },
  play: (context, targetIndex) =>
    addGcgZoneCardToCharacter(context, targetIndex, LOTUS_FLOWER_CRISP_ID, lotusFlowerCrisp),
};
