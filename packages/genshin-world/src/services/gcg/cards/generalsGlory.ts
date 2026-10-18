import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { GCG_CRYSTALLIZE_SHIELD } from "#src/services/gcg/constants";
import { addGcgShield } from "#src/services/gcg/effects/addGcgShield";
import { takeOne } from "@esposter/shared";

const GENERALS_GLORY_DAMAGE = 1;
const GENERALS_GLORY_USAGES = 2;
const GENERALS_GLORY_GEO_CHARACTERS = 2;

// General's Glory, a summon: at each End Phase it deals 1 Geo DMG, and with two Geo characters in the party, a Crystallize
// Shield goes to its side's active character, for 2 usages
export const generalsGlory: GcgCardModule = {
  initialUsages: GENERALS_GLORY_USAGES,
  onEndPhase: ({ duel, sideIndex }, zoneCard) => {
    const side = takeOne(duel.sides, sideIndex);
    zoneCard.usages -= 1;
    const geoCount = side.characters.filter(({ character }) => character.element === Element.Geo).length;
    const active = side.characters.at(side.activeIndex);
    if (geoCount >= GENERALS_GLORY_GEO_CHARACTERS && active) addGcgShield(active, GCG_CRYSTALLIZE_SHIELD);
    return { damageType: Element.Geo, value: GENERALS_GLORY_DAMAGE };
  },
};
