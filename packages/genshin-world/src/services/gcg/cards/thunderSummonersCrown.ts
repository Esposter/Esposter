import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { createGcgElementCostReduction } from "#src/services/gcg/effects/createGcgElementCostReduction";

const THUNDER_SUMMONERS_CROWN_ID = 312_401;

// Thunder Summoner's Crown: once per round a talent card played or a skill used spends one Electro die less
export const thunderSummonersCrown: GcgCardModule = createGcgElementCostReduction(
  THUNDER_SUMMONERS_CROWN_ID,
  Element.Electro,
);
