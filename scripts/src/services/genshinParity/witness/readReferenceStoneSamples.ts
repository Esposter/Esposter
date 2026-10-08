import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { StoneLightSample } from "#src/models/genshinParity/witness/StoneLightSample";
import type { Matrix3 } from "three";

import { computeFogOpacity } from "#src/services/genshinParity/sky/computeFogOpacity";
import { readStoneLightReading } from "#src/services/genshinParity/witness/readStoneLightReading";

// A reference's stone samples over the parts the witness draws from the game's exports (`readStoneLightReading`),
// Each hidden by the scene's own haze as much as it integrates to along the ray, beside the white balance its frame
// Passes through. With `isSelf` they are the exports as the scene draws them under its own light
export const readReferenceStoneSamples = async (
  referenceId: string,
  witness: DerivedAssetComponent,
  isSelf = false,
): Promise<{ samples: StoneLightSample[]; whiteBalance: Matrix3 }> => {
  const { eye, fog, pixels, whiteBalance } = await readStoneLightReading(referenceId, witness, isSelf);
  for (const { point, sample } of pixels) sample.opacity = computeFogOpacity(eye, point, fog);
  return { samples: pixels.map(({ sample }) => sample), whiteBalance };
};
