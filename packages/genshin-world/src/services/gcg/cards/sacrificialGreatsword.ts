import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { createGcgDice } from "#src/services/gcg/effects/createGcgDice";
import { createGcgWeaponCard } from "#src/services/gcg/effects/createGcgWeaponCard";
import { takeOne } from "@esposter/shared";

const SACRIFICIAL_GREATSWORD_ID = 311_302;

// Sacrificial Greatsword: the equipped Claymore character deals +1 DMG, and after it uses an Elemental Skill a die of its
// Element is created, once per round
export const sacrificialGreatsword: GcgCardModule = {
  ...createGcgWeaponCard("CLAYMORE"),
  onSkillUsed: ({ duel, sideIndex }, skill) => {
    const side = takeOne(duel.sides, sideIndex);
    if (skill.kind !== GcgSkillKind.ElementalSkill || side.usedCardIds.includes(SACRIFICIAL_GREATSWORD_ID)) return;
    side.usedCardIds.push(SACRIFICIAL_GREATSWORD_ID);
    createGcgDice(side, takeOne(side.characters, side.activeIndex).character.element, 1);
  },
};
