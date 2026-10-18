import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { CEREMONIAL_GARMENT_ID, ceremonialGarment } from "#src/services/gcg/cards/ceremonialGarment";
import { healGcgCharacter } from "#src/services/gcg/effects/healGcgCharacter";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

const NEREIDS_ASCENSION_DAMAGE = 2;
const NEREIDS_ASCENSION_HEAL = 1;

// Nereid's Ascension, Kokomi's Elemental Burst: 2 Hydro DMG, every character of hers is healed 1 HP, and her active character
// Gains Ceremonial Garment once the damage is dealt
export const nereidsAscension: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    for (const character of side.characters) healGcgCharacter(character, NEREIDS_ASCENSION_HEAL);
    placeGcgZoneCard(takeOne(side.characters, side.activeIndex).statuses, CEREMONIAL_GARMENT_ID, ceremonialGarment);
  },
  getDamage: () => ({ damageType: Element.Hydro, value: NEREIDS_ASCENSION_DAMAGE }),
};
