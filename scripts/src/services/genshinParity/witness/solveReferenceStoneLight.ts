import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { StoneLight } from "genshin-engine";

import { readReferenceStoneSamples } from "#src/services/genshinParity/witness/readReferenceStoneSamples";
import { solveStoneLight } from "#src/services/genshinParity/witness/solveStoneLight";

// A reference's stone light solved as the game's deferred pass casts it (`solveStoneLight`), over its stone's samples
// Under the scene's own haze (`readReferenceStoneSamples`). With `isSelf` it is solved against the exports as the scene
// Draws them under its own light, which should hand that light back if the solve models the renderer. Its darkening
// With height is held at the rate given
export const solveReferenceStoneLight = async (
  referenceId: string,
  witness: DerivedAssetComponent,
  isSelf = false,
  heightDarkening = 0,
): Promise<{ count: number; deviation: number; light: StoneLight; residual: number }> => {
  const { samples, whiteBalance } = await readReferenceStoneSamples(referenceId, witness, isSelf);
  return solveStoneLight(samples, whiteBalance, heightDarkening);
};
