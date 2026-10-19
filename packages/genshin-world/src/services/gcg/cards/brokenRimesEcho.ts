import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { BROKEN_RIMES_ECHO_ID } from "#src/services/gcg/cards/constants";
import { createGcgElementCostReduction } from "#src/services/gcg/effects/createGcgElementCostReduction";

// Broken Rime's Echo: once per round a talent card played or a skill used spends one Cryo die less
export const brokenRimesEcho: GcgCardModule = createGcgElementCostReduction(BROKEN_RIMES_ECHO_ID, Element.Cryo);
