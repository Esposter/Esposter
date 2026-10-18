import type { Element } from "#src/models/Element";
import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";

// An infusion: the character it is attached to has its Physical DMG dealt converted to the element, for the rounds given
// (two, when none is)
export const createGcgInfusion = (element: Element, rounds = 2): GcgCardModule => ({
  initialRounds: rounds,
  modifyDamageDealt: (_context, damage) =>
    damage.damageType === GcgDamageKind.Physical ? { ...damage, damageType: element } : damage,
});
