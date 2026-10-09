import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { createGcgDice } from "#src/services/gcg/effects/createGcgDice";
import { takeOne } from "@esposter/shared";

const SACRIFICIAL_GREATSWORD_ID = 311_302;
// Only a Claymore character can equip it, as the card names
const CLAYMORE_WEAPON = "CLAYMORE";

// Sacrificial Greatsword: the equipped character deals +1 DMG, and after it uses an Elemental Skill a die of its element is
// Created, once per round
export const sacrificialGreatsword: GcgCardModule = {
  canPlay: ({ duel, sideIndex }, targetIndex) =>
    targetIndex !== undefined &&
    takeOne(duel.sides, sideIndex).characters.at(targetIndex)?.character.weapon === CLAYMORE_WEAPON,
  modifyDamageDealt: (_context, damage) => ({ ...damage, value: damage.value + 1 }),
  onSkillUsed: ({ duel, sideIndex }, skill) => {
    const side = takeOne(duel.sides, sideIndex);
    if (skill.kind !== GcgSkillKind.ElementalSkill || side.usedCardIds.includes(SACRIFICIAL_GREATSWORD_ID)) return;
    side.usedCardIds.push(SACRIFICIAL_GREATSWORD_ID);
    createGcgDice(side, takeOne(side.characters, side.activeIndex).character.element, 1);
  },
};
