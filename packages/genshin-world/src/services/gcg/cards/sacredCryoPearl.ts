import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";

const SACRED_CRYO_PEARL_DAMAGE = 1;
const SACRED_CRYO_PEARL_PIERCING_DAMAGE = 1;

// Sacred Cryo Pearl, a summon: at the end phase, 1 Piercing DMG to each opposing character on standby, and 1 Cryo DMG to
// The opposing active character, for two usages
export const sacredCryoPearl: GcgCardModule = {
  endPhaseStandbyPiercing: SACRED_CRYO_PEARL_PIERCING_DAMAGE,
  initialUsages: 2,
  onEndPhase: (_context, zoneCard) => {
    zoneCard.usages -= 1;
    return { damageType: Element.Cryo, value: SACRED_CRYO_PEARL_DAMAGE };
  },
};
