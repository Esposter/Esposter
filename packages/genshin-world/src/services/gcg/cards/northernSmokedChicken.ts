import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { NORTHERN_SMOKED_CHICKEN_ID } from "#src/services/gcg/cards/constants";
import { addGcgZoneCardToCharacter } from "#src/services/gcg/effects/addGcgZoneCardToCharacter";
import { checkIsGcgActiveHolder } from "#src/services/gcg/effects/checkIsGcgActiveHolder";
import { checkIsGcgFoodEatable } from "#src/services/gcg/effects/checkIsGcgFoodEatable";

// Northern Smoked Chicken: the target character's next Normal Attack this round costs one Unaligned die less, and a
// Character eats one food a round
export const northernSmokedChicken: GcgCardModule = {
  canPlay: ({ duel, sideIndex }, targetIndex) => checkIsGcgFoodEatable(duel, sideIndex, targetIndex),
  initialRounds: 1,
  initialUsages: 1,
  onCostPaid: (_context, subject, zoneCard) => {
    if (subject.skill?.kind === GcgSkillKind.NormalAttack) zoneCard.usages = 0;
  },
  play: (context, targetIndex) => {
    addGcgZoneCardToCharacter(context, targetIndex, NORTHERN_SMOKED_CHICKEN_ID, northernSmokedChicken);
  },
  reduceCost: (context, subject) =>
    checkIsGcgActiveHolder(context) &&
    subject.skill?.kind === GcgSkillKind.NormalAttack &&
    subject.costs.some(({ kind }) => kind === GcgCostKind.Unaligned)
      ? { count: 1, element: undefined }
      : undefined,
};
