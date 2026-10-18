import type { Element } from "#src/models/Element";
import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { checkCanPlayGcgElementalResonance } from "#src/services/gcg/effects/checkCanPlayGcgElementalResonance";
import { createGcgDice } from "#src/services/gcg/effects/createGcgDice";
import { takeOne } from "@esposter/shared";

// An Elemental Resonance event: a die of its element is created, and the card is played only with two characters of that
// Element on the side
export const createGcgElementalResonance = (element: Element): GcgCardModule => ({
  canPlay: ({ duel, sideIndex }) => checkCanPlayGcgElementalResonance(takeOne(duel.sides, sideIndex), element),
  play: ({ duel, sideIndex }) => {
    createGcgDice(takeOne(duel.sides, sideIndex), element, 1);
  },
});
