import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { summonGcgOceanicMimics } from "#src/services/gcg/effects/summonGcgOceanicMimics";
import { takeOne } from "@esposter/shared";

// The Myriad Wilds, Rhodeia of Loch's elemental skill: no damage, and two Oceanic Mimics are summoned (the wiki's The
// Myriad Wilds (Character Card Skill))
export const theMyriadWilds: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    summonGcgOceanicMimics(takeOne(duel.sides, sideIndex), 2);
  },
};
