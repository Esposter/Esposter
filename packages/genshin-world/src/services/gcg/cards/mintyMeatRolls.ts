import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { canEatGcgFood } from "#src/services/gcg/effects/canEatGcgFood";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { takeOne } from "@esposter/shared";

const MINTY_MEAT_ROLLS_ID = 333_008;

// Minty Meat Rolls: until the round ends, the target character's next three Normal Attacks cost one Unaligned die less, as
// A status the target holds, and it eats no other food this round
export const mintyMeatRolls: GcgCardModule = {
  canPlay: ({ duel, sideIndex }, targetIndex) => canEatGcgFood(duel, sideIndex, targetIndex),
  initialRounds: 1,
  initialUsages: 3,
  onCostPaid: (_context, _subject, zoneCard) => {
    zoneCard.usages -= 1;
  },
  play: ({ duel, sideIndex }, targetIndex) => {
    const character = targetIndex === undefined ? undefined : takeOne(duel.sides, sideIndex).characters.at(targetIndex);
    character?.statuses.push(createGcgZoneCard(MINTY_MEAT_ROLLS_ID, mintyMeatRolls));
  },
  reduceCost: (_context, subject, zoneCard) =>
    subject.skill?.kind === GcgSkillKind.NormalAttack && zoneCard.usages > 0
      ? { count: 1, element: undefined, kind: GcgCostKind.Unaligned }
      : undefined,
};
