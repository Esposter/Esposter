import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { checkIsGcgFoodEatable } from "#src/services/gcg/effects/checkIsGcgFoodEatable";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { takeOne } from "@esposter/shared";

const NORTHERN_SMOKED_CHICKEN_ID = 333_004;

// Northern Smoked Chicken: the target character's next Normal Attack this round costs one Unaligned die less, and a
// Character eats one food a round
export const northernSmokedChicken: GcgCardModule = {
  canPlay: ({ duel, sideIndex }, targetIndex) => checkIsGcgFoodEatable(duel, sideIndex, targetIndex),
  initialRounds: 1,
  initialUsages: 1,
  onCostPaid: (_context, subject, zoneCard) => {
    if (subject.skill?.kind === GcgSkillKind.NormalAttack) zoneCard.usages = 0;
  },
  play: ({ duel, sideIndex }, targetIndex) => {
    const side = takeOne(duel.sides, sideIndex);
    const character = targetIndex === undefined ? undefined : side.characters.at(targetIndex);
    character?.statuses.push(createGcgZoneCard(NORTHERN_SMOKED_CHICKEN_ID, northernSmokedChicken));
  },
  reduceCost: (_context, subject) =>
    subject.skill?.kind === GcgSkillKind.NormalAttack &&
    subject.costs.some(({ kind }) => kind === GcgCostKind.Unaligned)
      ? { count: 1, element: undefined }
      : undefined,
};
