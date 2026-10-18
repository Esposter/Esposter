import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { takeOne } from "@esposter/shared";
import { ELLIN_ID } from "#src/services/gcg/cards/constants";

// Ellin: once per round, a skill used after it was already used this round spends one die less
export const ellin: GcgCardModule = {
  onCostPaid: ({ duel, sideIndex }) => {
    takeOne(duel.sides, sideIndex).usedCardIds.push(ELLIN_ID);
  },
  reduceCost: ({ duel, sideIndex }, subject) => {
    const side = takeOne(duel.sides, sideIndex);
    const isRepeated = subject.skill !== undefined && side.usedSkillIds.includes(subject.skill.id);
    return isRepeated && !side.usedCardIds.includes(ELLIN_ID) ? { count: 1, element: undefined } : undefined;
  },
};
