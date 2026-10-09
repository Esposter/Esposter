import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";

// The Wolf Within: for two rounds, after the character it is attached to uses a Normal Attack or an Elemental Skill, 2 Electro
// DMG is dealt to the opposing active character (the wiki's Lightning Fang (Character Card Skill))
const THE_WOLF_WITHIN_DAMAGE = 2;

export const theWolfWithin: GcgCardModule = {
  initialRounds: 2,
  onSkillUsed: (_context, skill) => {
    if (skill.kind !== GcgSkillKind.NormalAttack && skill.kind !== GcgSkillKind.ElementalSkill) return undefined;
    return { damageType: Element.Electro, value: THE_WOLF_WITHIN_DAMAGE };
  },
};
