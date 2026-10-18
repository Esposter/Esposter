import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { fullPlate } from "#src/services/gcg/cards/fullPlate";
import { GCG_SHIELD_LIMIT } from "#src/services/gcg/constants";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { takeOne } from "@esposter/shared";

const BREASTPLATE_DAMAGE = 1;
const FULL_PLATE_ID = 116_021;
const FULL_PLATE_SHIELD = 2;

// Breastplate, Noelle's elemental skill: 1 Geo DMG, and a Full Plate onstage, which grants 2 Shield points to the active
// Character as it is created (the wiki's Breastplate (Character Card Skill))
export const breastplate: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    const user = side.characters.at(side.activeIndex);
    if (user) user.shield = Math.min(GCG_SHIELD_LIMIT, user.shield + FULL_PLATE_SHIELD);
    side.onstages.push(createGcgZoneCard(FULL_PLATE_ID, fullPlate));
  },
  getDamage: () => ({ damageType: Element.Geo, value: BREASTPLATE_DAMAGE }),
};
