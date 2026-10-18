import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";

const DARKFIRE_FURNACE_DAMAGE = 1;

// Darkfire Furnace, Abyss Lector's summon: End Phase 1 Pyro DMG to the opposing active character, and 1 piercing DMG to each
// Opposing character on standby (the wiki's Darkfire Furnace). It is spent after its two usages
export const darkfireFurnace: GcgCardModule = {
  endPhaseStandbyPiercing: DARKFIRE_FURNACE_DAMAGE,
  initialUsages: 2,
  onEndPhase: (_context, zoneCard) => {
    zoneCard.usages -= 1;
    return { damageType: Element.Pyro, value: DARKFIRE_FURNACE_DAMAGE };
  },
};
