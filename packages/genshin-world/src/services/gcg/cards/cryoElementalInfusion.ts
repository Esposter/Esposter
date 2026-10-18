import { Element } from "#src/models/Element";
import { createGcgInfusion } from "#src/services/gcg/effects/createGcgInfusion";

export const CRYO_ELEMENTAL_INFUSION_ID = 111_052;
export const CRYO_ELEMENTAL_INFUSION_ROUNDS = 1;

// Cryo Elemental Infusion, the status Kamisato Art: Senho gives Ayaka: her Physical DMG is dealt as Cryo DMG until the Round
// Ends (the dump's 111052)
export const cryoElementalInfusion = createGcgInfusion(Element.Cryo, CRYO_ELEMENTAL_INFUSION_ROUNDS);
