import { Element } from "#src/models/Element";
import { createGcgInfusion } from "#src/services/gcg/effects/createGcgInfusion";

// Pyro Infusion: the character it is attached to has its Physical DMG dealt converted to Pyro DMG, for two rounds
export const pyroInfusion = createGcgInfusion(Element.Pyro);
