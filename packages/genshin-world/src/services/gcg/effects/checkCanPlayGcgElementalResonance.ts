import type { Element } from "#src/models/Element";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

const CHARACTERS_NEEDED = 2;

// Whether a side holds the two characters of an element that an Elemental Resonance card needs to be played
export const checkCanPlayGcgElementalResonance = (side: GcgSideState, element: Element): boolean =>
  side.characters.filter(({ character }) => character.element === element).length >= CHARACTERS_NEEDED;
