import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";

const LARGE_WIND_SPIRIT_DAMAGE = 2;

// Large Wind Spirit, which Forbidden Creation summons: at the end phase, 2 DMG of its element, Anemo until a Swirl reaction
// its side makes converts it to the element Swirled, once, for three usages
export const largeWindSpirit: GcgCardModule = {
  initialUsages: 3,
  onEndPhase: (_context, zoneCard) => {
    zoneCard.usages -= 1;
    return { damageType: zoneCard.element ?? Element.Anemo, value: LARGE_WIND_SPIRIT_DAMAGE };
  },
  onSwirl: (_context, zoneCard, element) => {
    if (zoneCard.element === undefined) zoneCard.element = element;
  },
};
