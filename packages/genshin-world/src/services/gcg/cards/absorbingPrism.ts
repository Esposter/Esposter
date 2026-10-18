import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { ELECTRO_CRYSTAL_CORE_ID, electroCrystalCore } from "#src/services/gcg/cards/electroCrystalCore";
import { healGcgCharacter } from "#src/services/gcg/effects/healGcgCharacter";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

export const ABSORBING_PRISM_ID = 224_011;
const ELECTRO_HYPOSTASIS_ID = 2_401;
const ABSORBING_PRISM_HEAL = 3;

// Absorbing Prism, an event: when the active character is Electro Hypostasis, it is healed for 3 HP and gains the Electro
// Crystal Core (the wiki's Absorbing Prism). Refused when the active character is another
export const absorbingPrism: GcgCardModule = {
  canPlay: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    return takeOne(side.characters, side.activeIndex).character.id === ELECTRO_HYPOSTASIS_ID;
  },
  play: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    const active = takeOne(side.characters, side.activeIndex);
    healGcgCharacter(active, ABSORBING_PRISM_HEAL);
    placeGcgZoneCard(active.statuses, ELECTRO_CRYSTAL_CORE_ID, electroCrystalCore);
  },
};
