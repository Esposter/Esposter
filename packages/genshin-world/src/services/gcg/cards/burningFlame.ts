import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";

const BURNING_FLAME_DAMAGE = 1;

// Burning Flame: at the end phase it deals one Pyro DMG to the opposing active character and spends a usage, for one usage
// Each further Burning reaction adds a usage, up to two
export const burningFlame: GcgCardModule = {
  initialUsages: 1,
  onEndPhase: (_context, zoneCard) => {
    zoneCard.usages -= 1;
    return { damageType: Element.Pyro, value: BURNING_FLAME_DAMAGE };
  },
};
