import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { createGcgDice } from "#src/services/gcg/effects/createGcgDice";
import { createGcgWeaponCard } from "#src/services/gcg/effects/createGcgWeaponCard";
import { takeOne } from "@esposter/shared";

// A Sacrificial weapon: the equipped character of its weapon kind deals +1 DMG, and after it uses an Elemental Skill a die of
// Its Element is created, once per round. The round's record of use is kept under the card's own id
export const createGcgSacrificialWeapon = (cardId: number, weapon: string): GcgCardModule => ({
  ...createGcgWeaponCard(weapon),
  onSkillUsed: ({ duel, sideIndex }, skill) => {
    const side = takeOne(duel.sides, sideIndex);
    if (skill.kind !== GcgSkillKind.ElementalSkill || side.usedCardIds.includes(cardId)) return;
    side.usedCardIds.push(cardId);
    createGcgDice(side, takeOne(side.characters, side.activeIndex).character.element, 1);
  },
});
