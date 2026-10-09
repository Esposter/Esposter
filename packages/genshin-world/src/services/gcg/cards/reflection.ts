import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";

const REFLECTION_REDUCTION = 1;

// Reflection: the active character takes one less DMG, for one usage, and at the end phase the summon is discarded for one
// Hydro DMG to the opposing active character, which the phase runner deals
export const reflection: GcgCardModule = {
  initialUsages: 1,
  modifyDamageReceived: (_context, value, zoneCard) => {
    zoneCard.usages -= 1;
    return Math.max(0, value - REFLECTION_REDUCTION);
  },
  onEndPhase: (_context, zoneCard) => {
    zoneCard.usages = 0;
    return { damageType: Element.Hydro, value: 1 };
  },
};
