import type { Element } from "#src/models/Element";
import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { createGcgDice } from "#src/services/gcg/effects/createGcgDice";
import { takeOne } from "@esposter/shared";

const CHARACTERS_NEEDED = 2;

// Whether a side holds the two characters of an element that an Elemental Resonance card needs to be played
export const checkCanPlayGcgElementalResonance = (side: GcgSideState, element: Element): boolean =>
  side.characters.filter(({ character }) => character.element === element).length >= CHARACTERS_NEEDED;

// An Elemental Resonance event: a die of its element is created, and the card is played only with two characters of that
// Element on the side
export const createGcgElementalResonance = (element: Element): GcgCardModule => ({
  canPlay: ({ duel, sideIndex }) => checkCanPlayGcgElementalResonance(takeOne(duel.sides, sideIndex), element),
  play: ({ duel, sideIndex }) => {
    createGcgDice(takeOne(duel.sides, sideIndex), element, 1);
  },
});
