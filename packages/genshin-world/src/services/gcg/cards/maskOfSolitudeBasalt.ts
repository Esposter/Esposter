import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { createGcgElementCostReduction } from "#src/services/gcg/effects/createGcgElementCostReduction";

// Mask of Solitude Basalt: once a round, a talent card played or a skill used spends one Geo die less
export const maskOfSolitudeBasalt: GcgCardModule = createGcgElementCostReduction(312_601, Element.Geo);
