import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";

// Oceanic Mimic: Raptor, a summon for three usages that deals 1 Hydro DMG at the end phase (the wiki's Oceanid Mimic Summoning)
const RAPTOR_DAMAGE = 1;

export const oceanicMimicRaptor: GcgCardModule = {
  initialUsages: 3,
  onEndPhase: (_context, zoneCard) => {
    zoneCard.usages -= 1;
    return { damageType: Element.Hydro, value: RAPTOR_DAMAGE };
  },
};
