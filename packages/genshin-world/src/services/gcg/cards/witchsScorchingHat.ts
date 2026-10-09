import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { createGcgElementCostReduction } from "#src/services/gcg/effects/createGcgElementCostReduction";

const WITCHS_SCORCHING_HAT_ID = 312_301;

// Witch's Scorching Hat: once per round a talent card played or a skill used spends one Pyro die less
export const witchsScorchingHat: GcgCardModule = createGcgElementCostReduction(WITCHS_SCORCHING_HAT_ID, Element.Pyro);
