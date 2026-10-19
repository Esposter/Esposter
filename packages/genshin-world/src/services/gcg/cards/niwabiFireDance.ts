import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { NIWABI_ENSHOU_ID } from "#src/services/gcg/cards/constants";
import { niwabiEnshou } from "#src/services/gcg/cards/niwabiEnshou";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { takeOne } from "@esposter/shared";

// Niwabi Fire-Dance, Yoimiya's elemental skill: no damage, and the active character gains Niwabi Enshou (the wiki's Niwabi
// Fire-Dance (Character Card Skill))
export const niwabiFireDance: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    takeOne(side.characters, side.activeIndex).statuses.push(createGcgZoneCard(NIWABI_ENSHOU_ID, niwabiEnshou));
  },
};
