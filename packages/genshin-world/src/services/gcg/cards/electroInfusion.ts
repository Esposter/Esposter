import { Element } from "#src/models/Element";
import { createGcgInfusion } from "#src/services/gcg/effects/createGcgInfusion";

// Electro Infusion, the status card 114032 (Electro Elemental Infusion) that Keqing's Stellar Restoration grants
export const electroInfusion = createGcgInfusion(Element.Electro);
