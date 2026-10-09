import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { switchGcgOpposingActive } from "#src/services/gcg/effects/switchGcgOpposingActive";

// Gale Blade, Jean's elemental skill: 3 Anemo DMG, and the target is forcibly switched to the next character (the wiki's
// Gale Blade (Character Card Skill))
const GALE_BLADE_DAMAGE = 3;

export const galeBlade: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    switchGcgOpposingActive(duel, sideIndex, 1);
  },
  getDamage: () => ({ damageType: Element.Anemo, value: GALE_BLADE_DAMAGE }),
};
