import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";

// Shadowsword: Galloping Frost, a summon for two usages that deals 1 Cryo DMG at the end phase (the wiki's Frosty Assault)
const GALLOPING_FROST_DAMAGE = 1;

export const shadowswordGallopingFrost: GcgCardModule = {
  initialUsages: 2,
  onEndPhase: (_context, zoneCard) => {
    zoneCard.usages -= 1;
    return { damageType: Element.Cryo, value: GALLOPING_FROST_DAMAGE };
  },
};
