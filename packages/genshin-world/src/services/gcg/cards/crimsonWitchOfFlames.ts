import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { createGcgElementCostReduction } from "#src/services/gcg/effects/createGcgElementCostReduction";
import { setGcgDiceFaces } from "#src/services/gcg/effects/setGcgDiceFaces";
import { takeOne } from "@esposter/shared";

const CRIMSON_WITCH_OF_FLAMES_ID = 312_302;

// Crimson Witch of Flames: once per round a talent card played or a skill used spends one Pyro die less, and the two
// Starting dice rolled are Pyro
export const crimsonWitchOfFlames: GcgCardModule = {
  ...createGcgElementCostReduction(CRIMSON_WITCH_OF_FLAMES_ID, Element.Pyro),
  onRollPhase: ({ duel, sideIndex }) => {
    setGcgDiceFaces(takeOne(duel.sides, sideIndex), Element.Pyro, 2);
  },
};
