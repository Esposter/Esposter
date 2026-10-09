import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";

const FLOWFIRE_EDGE_USAGES = 3;

// Flowfire Edge, which Blazing Axe Mitachurl's passive gives it at the battle's start: the Physical DMG the character deals
// Is converted to Pyro, for three usages
export const flowfireEdge: GcgCardModule = {
  initialUsages: FLOWFIRE_EDGE_USAGES,
  modifyDamageDealt: (_context, damage, zoneCard) => {
    if (damage.damageType !== GcgDamageKind.Physical || zoneCard.usages <= 0) return damage;
    zoneCard.usages -= 1;
    return { ...damage, damageType: Element.Pyro };
  },
};
