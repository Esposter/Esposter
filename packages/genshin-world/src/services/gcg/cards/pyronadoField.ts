import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";

const PYRONADO_FIELD_DAMAGE = 2;

// Pyronado, which Pyronado creates: after the side's character uses a skill, 2 Pyro DMG, for two usages
export const pyronadoField: GcgCardModule = {
  initialUsages: 2,
  onSkillUsed: (_context, _skill, zoneCard) => {
    zoneCard.usages -= 1;
    return { damageType: Element.Pyro, value: PYRONADO_FIELD_DAMAGE };
  },
};
