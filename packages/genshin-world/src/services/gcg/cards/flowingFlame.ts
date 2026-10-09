import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { takeOne } from "@esposter/shared";

const FLOWING_FLAME_CHARACTER_ID = 1301;
const SEARING_ONSLAUGHT_ID = 13_012;

// Flowing Flame, Diluc's talent: equipped to Diluc while she is active, it has her Searing Onslaught used at once, and her
// Second and third uses each round spend one Pyro die less
export const flowingFlame: GcgCardModule = {
  canPlay: ({ duel, sideIndex }, targetIndex) => {
    const side = takeOne(duel.sides, sideIndex);
    return (
      targetIndex !== undefined &&
      targetIndex === side.activeIndex &&
      takeOne(side.characters, targetIndex).character.id === FLOWING_FLAME_CHARACTER_ID
    );
  },
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
  skillOnPlay: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    return takeOne(side.characters, side.activeIndex).character.skills.find(
      ({ kind }) => kind === GcgSkillKind.ElementalSkill,
    );
  },
};
