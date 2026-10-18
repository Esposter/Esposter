import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { BAKE_KURAGE_ID, bakeKurage } from "#src/services/gcg/cards/bakeKurage";
import { applyGcgApplication } from "#src/services/gcg/effects/applyGcgApplication";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

// Kurage's Oath, Kokomi's Elemental Skill, which deals no DMG: her active character gains Hydro Application, and a Bake-Kurage
// Is summoned
export const kurageOath: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    applyGcgApplication(duel, sideIndex, takeOne(side.characters, side.activeIndex), Element.Hydro);
    placeGcgZoneCard(side.summons, BAKE_KURAGE_ID, bakeKurage);
  },
};
