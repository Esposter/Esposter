import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";

// Oceanic Mimic: Squirrel, a summon for two usages that deals 2 Hydro DMG at the end phase (the wiki's Oceanid Mimic Summoning)
const SQUIRREL_DAMAGE = 2;

export const oceanicMimicSquirrel: GcgCardModule = {
  initialUsages: 2,
  onEndPhase: (_context, zoneCard) => {
    zoneCard.usages -= 1;
    return { damageType: Element.Hydro, value: SQUIRREL_DAMAGE };
  },
};
