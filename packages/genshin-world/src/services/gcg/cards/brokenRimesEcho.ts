import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { createGcgElementCostReduction } from "#src/services/gcg/effects/createGcgElementCostReduction";

const BROKEN_RIMES_ECHO_ID = 312_101;

// Broken Rime's Echo: once per round a talent card played or a skill used spends one Cryo die less
export const brokenRimesEcho: GcgCardModule = createGcgElementCostReduction(BROKEN_RIMES_ECHO_ID, Element.Cryo);
