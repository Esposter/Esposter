import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";

export const HILICHURL_BERSERKER_ID = 303_213;
const HILICHURL_BERSERKER_DAMAGE = 1;

// Hilichurl Berserker, a Hilichurl summon: End Phase 1 Pyro DMG, and it is spent after its two usages (the wiki's Hilichurl Berserker)
export const hilichurlBerserker: GcgCardModule = {
  initialUsages: 2,
  onEndPhase: (_context, zoneCard) => {
    zoneCard.usages -= 1;
    return { damageType: Element.Pyro, value: HILICHURL_BERSERKER_DAMAGE };
  },
};
