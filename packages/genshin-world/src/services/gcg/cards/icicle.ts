import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";

const ICICLE_DAMAGE = 2;

// Icicle, which Glacial Waltz creates: after its side switches characters, 2 Cryo DMG, for three usages
export const icicle: GcgCardModule = {
  initialUsages: 3,
  onSwitch: (_context, zoneCard) => {
    zoneCard.usages -= 1;
    return { damageType: Element.Cryo, value: ICICLE_DAMAGE };
  },
};
