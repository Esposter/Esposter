import { Element } from "#src/models/Element";
import { createGcgElementalResonance } from "#src/services/gcg/effects/createGcgElementalResonance";

// Elemental Resonance: Woven Ice: a Cryo die is created, and the card is played only with two Cryo characters in the
// Deck
export const elementalResonanceWovenIce = createGcgElementalResonance(Element.Cryo);
