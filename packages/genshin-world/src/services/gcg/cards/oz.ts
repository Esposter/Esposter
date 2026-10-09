import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";

const OZ_DAMAGE = 1;

// Oz, which Nightrider summons: at the end phase, 1 Electro DMG, for two usages
export const oz: GcgCardModule = {
  initialUsages: 2,
  onEndPhase: (_context, zoneCard) => {
    zoneCard.usages -= 1;
    return { damageType: Element.Electro, value: OZ_DAMAGE };
  },
};
