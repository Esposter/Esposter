import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";

const LARGE_WIND_SPIRIT_DAMAGE = 2;

// Large Wind Spirit, which Forbidden Creation summons: at the end phase, 2 Anemo DMG, for three usages
export const largeWindSpirit: GcgCardModule = {
  initialUsages: 3,
  onEndPhase: (_context, zoneCard) => {
    zoneCard.usages -= 1;
    return { damageType: Element.Anemo, value: LARGE_WIND_SPIRIT_DAMAGE };
  },
};
