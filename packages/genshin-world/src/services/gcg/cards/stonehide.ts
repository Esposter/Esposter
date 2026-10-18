import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";

const STONEHIDE_DAMAGE_REDUCTION = 1;
const STONEHIDE_USAGES = 3;

// Stonehide, a status on the character it is attached to: the DMG the character takes is decreased by 1, and a Geo DMG that
// Is decreased spends one usage more, for three usages
export const stonehide: GcgCardModule = {
  initialUsages: STONEHIDE_USAGES,
  modifyDamageReceived: (_context, value, zoneCard, damageType) => {
    if (value <= 0) return value;
    zoneCard.usages -= damageType === Element.Geo ? 2 : 1;
    return Math.max(0, value - STONEHIDE_DAMAGE_REDUCTION);
  },
};
