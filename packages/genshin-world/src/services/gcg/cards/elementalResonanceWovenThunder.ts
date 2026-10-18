import { Element } from "#src/models/Element";
import { createGcgElementalResonance } from "#src/services/gcg/effects/createGcgElementalResonance";

// Elemental Resonance: Woven Thunder: an Electro die is created, and the card is played only with two Electro characters in
// The deck
export const elementalResonanceWovenThunder = createGcgElementalResonance(Element.Electro);
