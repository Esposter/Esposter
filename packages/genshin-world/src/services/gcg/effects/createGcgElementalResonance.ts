import type { Element } from "#src/models/Element";
import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { createGcgDice } from "#src/services/gcg/effects/createGcgDice";
import { takeOne } from "@esposter/shared";

const CHARACTERS_NEEDED = 2;

// An Elemental Resonance event: a die of its element is created, and the card is played only with two characters of that
// Element on the side
export const createGcgElementalResonance = (element: Element): GcgCardModule => ({
  canPlay: ({ duel, sideIndex }) =>
    takeOne(duel.sides, sideIndex).characters.filter(({ character }) => character.element === element).length >=
    CHARACTERS_NEEDED,
  play: ({ duel, sideIndex }) => {
    createGcgDice(takeOne(duel.sides, sideIndex), element, 1);
  },
});
