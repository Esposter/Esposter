import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";

export const TENKO_THUNDERBOLTS_ID = 114_083;
const TENKO_THUNDERBOLTS_DAMAGE = 3;

// Tenko Thunderbolts, an onstage card of one usage: before its side chooses its action it deals 3 Electro DMG and spends it
export const tenkoThunderbolts: GcgCardModule = {
  initialUsages: 1,
  onBeforeAction: (_context, zoneCard) => {
    zoneCard.usages -= 1;
    return { damageType: Element.Electro, value: TENKO_THUNDERBOLTS_DAMAGE };
  },
};
