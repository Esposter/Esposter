import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { createGcgElementCostReduction } from "#src/services/gcg/effects/createGcgElementCostReduction";
import { setGcgDiceFaces } from "#src/services/gcg/effects/setGcgDiceFaces";
import { takeOne } from "@esposter/shared";

const ARCHAIC_PETRA_ID = 312_602;

// Archaic Petra: once per round a talent card played or a skill used spends one Geo die less, and the two starting dice
// Rolled are Geo
export const archaicPetra: GcgCardModule = {
  ...createGcgElementCostReduction(ARCHAIC_PETRA_ID, Element.Geo),
  onRollPhase: ({ duel, sideIndex }) => {
    setGcgDiceFaces(takeOne(duel.sides, sideIndex), Element.Geo, 2);
  },
};
