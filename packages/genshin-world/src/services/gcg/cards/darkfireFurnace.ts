import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { applyGcgStandbyPiercing } from "#src/services/gcg/applyGcgDamage";

export const DARKFIRE_FURNACE_ID = 123_021;
const DARKFIRE_FURNACE_DAMAGE = 1;

// Darkfire Furnace, Abyss Lector's summon: End Phase 1 Pyro DMG to the opposing active character, and 1 piercing DMG to each
// Opposing character on standby (the wiki's Darkfire Furnace). It is spent after its two usages
export const darkfireFurnace: GcgCardModule = {
  initialUsages: 2,
  onEndPhase: ({ duel, sideIndex }, zoneCard) => {
    zoneCard.usages -= 1;
    applyGcgStandbyPiercing(duel, sideIndex, DARKFIRE_FURNACE_DAMAGE);
    return { damageType: Element.Pyro, value: DARKFIRE_FURNACE_DAMAGE };
  },
};
