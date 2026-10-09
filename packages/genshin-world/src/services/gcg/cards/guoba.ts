import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";

const GUOBA_DAMAGE = 2;

// Guoba, which Guoba Attack summons: at the end phase, 2 Pyro DMG, for two usages
export const guoba: GcgCardModule = {
  initialUsages: 2,
  onEndPhase: (_context, zoneCard) => {
    zoneCard.usages -= 1;
    return { damageType: Element.Pyro, value: GUOBA_DAMAGE };
  },
};
