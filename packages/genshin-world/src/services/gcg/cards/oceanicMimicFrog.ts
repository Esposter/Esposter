import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";

// Oceanic Mimic: Frog, which takes 1 DMG off the active character's damage once, then deals 2 Hydro DMG at the end phase and
// Is discarded. Its one usage is kept while the Frog is untouched, so the card stays on the field once it is depleted, and
// The counter records that the usage is spent
const FROG_DAMAGE_REDUCTION = 1;
const FROG_DAMAGE = 2;

export const oceanicMimicFrog: GcgCardModule = {
  initialUsages: 1,
  modifyDamageReceived: (_context, value, zoneCard) => {
    if (zoneCard.counter > 0) return value;
    zoneCard.counter = 1;
    return Math.max(0, value - FROG_DAMAGE_REDUCTION);
  },
  onEndPhase: (_context, zoneCard) => {
    if (zoneCard.counter === 0) return undefined;
    zoneCard.usages = 0;
    return { damageType: Element.Hydro, value: FROG_DAMAGE };
  },
};
