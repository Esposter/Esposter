import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { createGcgOncePerRoundCostReduction } from "#src/services/gcg/effects/createGcgOncePerRoundCostReduction";
import { takeOne } from "@esposter/shared";

export const SUMERU_CITY_ID = 321_010;
const SUMERU_CITY_REDUCTION = 1;

// Sumeru City, a Support: when its side plays a Talent card or uses a Skill, while the side does not have more Elemental Dice
// Than cards in its hand, 1 fewer die is spent, once per Round. A Technique is no Skill of a character's
export const sumeruCity: GcgCardModule = createGcgOncePerRoundCostReduction(
  SUMERU_CITY_ID,
  ({ duel, sideIndex }, subject) => {
    const side = takeOne(duel.sides, sideIndex);
    const isTalentOrSkill =
      subject.card?.kind === GcgCardKind.Talent ||
      (subject.skill !== undefined && subject.skill.kind !== GcgSkillKind.Technique);
    return isTalentOrSkill && side.dice.length <= side.hand.length
      ? { count: SUMERU_CITY_REDUCTION, element: undefined }
      : undefined;
  },
);
