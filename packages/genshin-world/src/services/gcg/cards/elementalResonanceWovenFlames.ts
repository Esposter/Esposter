import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { createGcgDice } from "#src/services/gcg/effects/createGcgDice";
import { takeOne } from "@esposter/shared";

const PYRO_CHARACTERS_NEEDED = 2;

// Elemental Resonance: Woven Flames: a Pyro die is created, and the card is played only with two Pyro characters in the deck
export const elementalResonanceWovenFlames: GcgCardModule = {
  canPlay: ({ duel, sideIndex }) =>
    takeOne(duel.sides, sideIndex).characters.filter(({ character }) => character.element === Element.Pyro).length >=
    PYRO_CHARACTERS_NEEDED,
  play: ({ duel, sideIndex }) => {
    createGcgDice(takeOne(duel.sides, sideIndex), Element.Pyro, 1);
  },
};
