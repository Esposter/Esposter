import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { rainbowBladework } from "#src/services/gcg/cards/rainbowBladework";
import { applyGcgApplication } from "#src/services/gcg/effects/applyGcgApplication";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { takeOne } from "@esposter/shared";

const RAINCUTTER_DAMAGE = 2;
const RAINBOW_BLADEWORK_ID = 112_022;

// Raincutter, Xingqiu's elemental burst: 2 Hydro DMG, Hydro Application on the active character, and a Rainbow Bladework
// Onstage (the wiki's Raincutter (Character Card Skill))
export const raincutter: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    const user = side.characters.at(side.activeIndex);
    if (user) applyGcgApplication(duel, sideIndex, user, Element.Hydro);
    side.onstages.push(createGcgZoneCard(RAINBOW_BLADEWORK_ID, rainbowBladework));
  },
  getDamage: () => ({ damageType: Element.Hydro, value: RAINCUTTER_DAMAGE }),
};
