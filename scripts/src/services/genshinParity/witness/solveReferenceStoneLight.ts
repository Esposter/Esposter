import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { StoneLight } from "genshin-engine";

import { computeFogOpacity } from "#src/services/genshinParity/sky/computeFogOpacity";
import { readStoneLightReading } from "#src/services/genshinParity/witness/readStoneLightReading";
import { solveStoneLight } from "#src/services/genshinParity/witness/solveStoneLight";

// A reference's stone light solved as the game's deferred pass casts it (`solveStoneLight`), over the parts the
// Witness draws from the game's exports (`readStoneLightReading`), each pixel hidden by the scene's own haze as much
// As it integrates to along the ray. With `isSelf` it is solved against the exports as the scene draws them under its
// Own light, which should hand that light back if the solve models the renderer
export const solveReferenceStoneLight = async (
  referenceId: string,
  witness: DerivedAssetComponent,
  isSelf = false,
): Promise<{ count: number; deviation: number; light: StoneLight; residual: number }> => {
  const { eye, fog, pixels, whiteBalance } = await readStoneLightReading(referenceId, witness, isSelf);
  for (const { point, sample } of pixels) sample.opacity = computeFogOpacity(eye, point, fog);
  return solveStoneLight(
    pixels.map(({ sample }) => sample),
    whiteBalance,
  );
};
