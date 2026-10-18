import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";

export const ELECTRO_HILICHURL_SHOOTER_ID = 303_214;
const ELECTRO_HILICHURL_SHOOTER_DAMAGE = 1;

// Electro Hilichurl Shooter, a Hilichurl summon: End Phase 1 Electro DMG, and it is spent after its two usages (the wiki's Electro Hilichurl Shooter)
export const electroHilichurlShooter: GcgCardModule = {
  initialUsages: 2,
  onEndPhase: (_context, zoneCard) => {
    zoneCard.usages -= 1;
    return { damageType: Element.Electro, value: ELECTRO_HILICHURL_SHOOTER_DAMAGE };
  },
};
