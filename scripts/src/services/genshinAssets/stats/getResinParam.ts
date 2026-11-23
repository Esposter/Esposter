import type { ResinParam } from "genshin-world";

import { readConstValue } from "#src/services/genshinAssets/shared/readConstValue";
import { RESIN_PARAM_CONST_NAME } from "#src/services/genshinAssets/stats/constants";
import { resinParamSchema } from "genshin-world";

// The Original Resin constants the game's constant table holds in its one row, in the order the row gives them: the refill
// Cap, the regeneration cap, the minutes a point regenerates in, the Original Resin a Primogem refill restores, and the
// Primogems each refill of a day costs. The record is checked against the World's schema as it is built
export const getResinParam = (): ResinParam => {
  const [refillCap, regenerationCap, regenerationMinutes, primogemRestore, refillPrices] =
    readConstValue(RESIN_PARAM_CONST_NAME);
  return resinParamSchema.parse({
    originalResinCap: Number(regenerationCap),
    originalResinRefillCap: Number(refillCap),
    originalResinRegenMinutes: Number(regenerationMinutes),
    primogemResinRefillPrices: (refillPrices ?? "").split(",").map(Number),
    primogemResinRestore: Number(primogemRestore),
  });
};
