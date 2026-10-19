import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { USHI_ID } from "#src/services/gcg/cards/constants";
import { attachSuperlativeSuperstrength } from "#src/services/gcg/cards/superlativeSuperstrength";
import { ushi } from "#src/services/gcg/cards/ushi";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

const MASATSU_ZETSUGI_DAMAGE = 1;

// Masatsu Zetsugi: Akaushi Burst!, Arataki Itto's Elemental Skill: 1 Geo DMG, Ushi is summoned, and her active character
// Gains Superlative Superstrength once the damage is dealt
export const masatsuZetsugi: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    placeGcgZoneCard(side.summons, USHI_ID, ushi);
    attachSuperlativeSuperstrength(takeOne(side.characters, side.activeIndex));
  },
  getDamage: () => ({ damageType: Element.Geo, value: MASATSU_ZETSUGI_DAMAGE }),
};
