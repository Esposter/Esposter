import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";

// Pyro Infusion: the character it is attached to has its Physical DMG dealt converted to Pyro DMG, for two rounds
export const pyroInfusion: GcgCardModule = {
  initialRounds: 2,
  modifyDamageDealt: (_context, damage) =>
    damage.damageType === GcgDamageKind.Physical ? { ...damage, damageType: Element.Pyro } : damage,
};
