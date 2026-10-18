import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { createGcgElementCostReduction } from "#src/services/gcg/effects/createGcgElementCostReduction";
import { VIRIDESCENT_VENERERS_DIADEM_ID } from "#src/services/gcg/cards/constants";

// Viridescent Venerer's Diadem: once per round a talent card played or a skill used spends one Anemo die less
export const viridescentVenerersDiadem: GcgCardModule = createGcgElementCostReduction(
  VIRIDESCENT_VENERERS_DIADEM_ID,
  Element.Anemo,
);
