import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { rainSword } from "#src/services/gcg/cards/rainSword";
import { applyGcgApplication } from "#src/services/gcg/effects/applyGcgApplication";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

const FATAL_RAINSCREEN_DAMAGE = 2;
const RAIN_SWORD_ID = 112_021;

// Fatal Rainscreen, Xingqiu's elemental skill: 2 Hydro DMG, Hydro Application on the active character, and a Rain Sword
// Onstage (the wiki's Fatal Rainscreen (Character Card Skill))
export const fatalRainscreen: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    const user = side.characters.at(side.activeIndex);
    if (user) applyGcgApplication(duel, sideIndex, user, Element.Hydro);
    side.onstages.push(createGcgZoneCard(RAIN_SWORD_ID, rainSword));
  },
  getDamage: () => ({ damageType: Element.Hydro, value: FATAL_RAINSCREEN_DAMAGE }),
};
