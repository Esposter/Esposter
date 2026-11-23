import { Element } from "#src/models/Element";
import { createGcgElementalResonance } from "#src/services/gcg/effects/createGcgElementalResonance";

// Elemental Resonance: Woven Thunder: an Electro die is created.
// The card is played only with two Electro characters in the deck.
export const elementalResonanceWovenThunder = createGcgElementalResonance(Element.Electro);
