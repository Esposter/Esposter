import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";

// Shadowsword: Lone Gale, a summon for two usages that deals 1 Anemo DMG at the end phase (the wiki's Blustering Blade)
const LONE_GALE_DAMAGE = 1;

export const shadowswordLoneGale: GcgCardModule = {
  initialUsages: 2,
  onEndPhase: (_context, zoneCard) => {
    zoneCard.usages -= 1;
    return { damageType: Element.Anemo, value: LONE_GALE_DAMAGE };
  },
};
