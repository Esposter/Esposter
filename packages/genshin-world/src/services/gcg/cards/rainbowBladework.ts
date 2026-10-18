import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";

const RAINBOW_BLADEWORK_DAMAGE = 1;
const RAINBOW_BLADEWORK_USAGES = 3;

// Rainbow Bladework, an onstage: after the side's character uses a Normal Attack, it deals 1 Hydro DMG, for three usages
export const rainbowBladework: GcgCardModule = {
  initialUsages: RAINBOW_BLADEWORK_USAGES,
  onSkillUsed: (_context, skill, zoneCard) => {
    if (skill.kind !== GcgSkillKind.NormalAttack || zoneCard.usages <= 0) return undefined;
    zoneCard.usages -= 1;
    return { damageType: Element.Hydro, value: RAINBOW_BLADEWORK_DAMAGE };
  },
};
