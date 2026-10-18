import { Element } from "#src/models/Element";
import { createGcgElementalResonance } from "#src/services/gcg/effects/createGcgElementalResonance";

// Elemental Resonance: Woven Flames: a Pyro die is created, and the card is played only with two Pyro characters in the deck
export const elementalResonanceWovenFlames = createGcgElementalResonance(Element.Pyro);
