import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { GCG_SHIELD_LIMIT } from "#src/services/gcg/constants";
import { checkCanPlayGcgElementalResonance } from "#src/services/gcg/effects/createGcgElementalResonance";
import { takeOne } from "@esposter/shared";

export const ELEMENTAL_RESONANCE_ENDURING_ROCK_ID = 331_602;
const ENDURING_ROCK_SHIELD = 3;

// Elemental Resonance: Enduring Rock: 3 shield points to the active character, and the card is played only with two Geo
// Characters in the party
export const elementalResonanceEnduringRock: GcgCardModule = {
  canPlay: ({ duel, sideIndex }) => checkCanPlayGcgElementalResonance(takeOne(duel.sides, sideIndex), Element.Geo),
  play: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    const active = side.characters.at(side.activeIndex);
    if (active) active.shield = Math.min(GCG_SHIELD_LIMIT, active.shield + ENDURING_ROCK_SHIELD);
  },
};
