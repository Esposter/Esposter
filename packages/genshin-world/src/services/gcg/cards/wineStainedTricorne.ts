import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { createGcgElementCostReduction } from "#src/services/gcg/effects/createGcgElementCostReduction";

const WINE_STAINED_TRICORNE_ID = 312_201;

// Wine-Stained Tricorne: once per round a talent card played or a skill used spends one Hydro die less
export const wineStainedTricorne: GcgCardModule = createGcgElementCostReduction(
  WINE_STAINED_TRICORNE_ID,
  Element.Hydro,
);
