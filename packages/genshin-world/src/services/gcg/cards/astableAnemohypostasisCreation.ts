import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { switchGcgOpposingActive } from "#src/services/gcg/effects/switchGcgOpposingActive";

// Astable Anemohypostasis Creation - 6308, Sucrose's elemental skill: 3 Anemo DMG, and the target is forcibly switched to
// The previous character (the wiki's Astable Anemohypostasis Creation - 6308 (Character Card Skill))
const ASTABLE_ANEMOHYPOSTASIS_CREATION_DAMAGE = 3;

export const astableAnemohypostasisCreation: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    switchGcgOpposingActive(duel, sideIndex, -1);
  },
  getDamage: () => ({ damageType: Element.Anemo, value: ASTABLE_ANEMOHYPOSTASIS_CREATION_DAMAGE }),
};
