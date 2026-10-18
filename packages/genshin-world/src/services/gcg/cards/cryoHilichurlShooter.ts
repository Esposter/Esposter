import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";

export const CRYO_HILICHURL_SHOOTER_ID = 303_211;
const CRYO_HILICHURL_SHOOTER_DAMAGE = 1;

// Cryo Hilichurl Shooter, a Hilichurl summon: End Phase 1 Cryo DMG, and it is spent after its two usages (the wiki's Cryo Hilichurl Shooter)
export const cryoHilichurlShooter: GcgCardModule = {
  initialUsages: 2,
  onEndPhase: (_context, zoneCard) => {
    zoneCard.usages -= 1;
    return { damageType: Element.Cryo, value: CRYO_HILICHURL_SHOOTER_DAMAGE };
  },
};
