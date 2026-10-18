import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { createGcgDice } from "#src/services/gcg/effects/createGcgDice";
import { findGcgAdjacentCharacterIndex } from "#src/services/gcg/findGcgAdjacentCharacterIndex";
import { takeOne } from "@esposter/shared";

const RANA_ID = 322_017;

// Rana, a companion: after her side's character uses an Elemental Skill, a die of the element of the next off-field character
// is created, once per Round (the wiki's Rana (Support Card)). The skill counts only when her side is the acting side
export const rana: GcgCardModule = {
  onAnySkillUsed: ({ duel, sideIndex }, skill) => {
    if (duel.actingSideIndex !== sideIndex || skill.kind !== GcgSkillKind.ElementalSkill) return;
    const side = takeOne(duel.sides, sideIndex);
    if (side.usedCardIds.includes(RANA_ID)) return;
    const nextIndex = findGcgAdjacentCharacterIndex(side, side.activeIndex, 1);
    if (nextIndex === undefined) return;
    side.usedCardIds.push(RANA_ID);
    createGcgDice(side, takeOne(side.characters, nextIndex).character.element, 1);
  },
};
