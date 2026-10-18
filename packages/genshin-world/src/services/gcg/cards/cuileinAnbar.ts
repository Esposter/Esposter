import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";

const CUILEIN_ANBAR_DAMAGE = 2;

// Cuilein-Anbar, the summon Trump-Card Kitty creates: at the end phase, 2 Dendro DMG, for two usages (the wiki's
// Cuilein-Anbar)
export const cuileinAnbar: GcgCardModule = {
  initialUsages: 2,
  onEndPhase: (_context, zoneCard) => {
    zoneCard.usages -= 1;
    return { damageType: Element.Dendro, value: CUILEIN_ANBAR_DAMAGE };
  },
};
