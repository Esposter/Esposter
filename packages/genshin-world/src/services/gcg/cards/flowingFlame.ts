import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { createGcgTalentCard } from "#src/services/gcg/effects/createGcgTalentCard";
import { takeOne } from "@esposter/shared";

const FLOWING_FLAME_CHARACTER_ID = 1301;
const SEARING_ONSLAUGHT_ID = 13_012;

// Flowing Flame, Diluc's talent: equipped to Diluc while she is active, it has her Searing Onslaught used at once, and her
// Second and third uses each round spend one Pyro die less
export const flowingFlame: GcgCardModule = {
  ...createGcgTalentCard(FLOWING_FLAME_CHARACTER_ID, SEARING_ONSLAUGHT_ID),
  reduceCost: ({ duel, sideIndex }, subject) => {
    const usesBefore = takeOne(duel.sides, sideIndex).usedSkillIds.filter(
      (skillId) => skillId === SEARING_ONSLAUGHT_ID,
    ).length;
    const isSearing = subject.skill?.id === SEARING_ONSLAUGHT_ID;
    if (!isSearing || usesBefore < 1 || usesBefore > 2) return undefined;
    return subject.costs.some((cost) => cost.kind === GcgCostKind.Dice && cost.element === Element.Pyro)
      ? { count: 1, element: Element.Pyro }
      : undefined;
  },
};
