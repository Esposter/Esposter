import { Element } from "#src/models/Element";
import { createGcgElementalResonance } from "#src/services/gcg/effects/createGcgElementalResonance";

// Elemental Resonance: Woven Stone: a Geo die is created, and the card is played only with two Geo characters in the party
export const elementalResonanceWovenStone = createGcgElementalResonance(Element.Geo);
