import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { createGcgElementCostReduction } from "#src/services/gcg/effects/createGcgElementCostReduction";

// Laurel Coronet: once a round, a talent card played or a skill used spends one Dendro die less
export const laurelCoronet: GcgCardModule = createGcgElementCostReduction(312_701, Element.Dendro);
