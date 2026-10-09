import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { summonGcgOceanicMimics } from "#src/services/gcg/effects/summonGcgOceanicMimics";
import { takeOne } from "@esposter/shared";

// Oceanid Mimic Summoning, Rhodeia of Loch's elemental skill: no damage, and one Oceanic Mimic is summoned (the wiki's
// Oceanid Mimic Summoning (Character Card Skill))
export const oceanidMimicSummoning: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    summonGcgOceanicMimics(takeOne(duel.sides, sideIndex), 1);
  },
};
