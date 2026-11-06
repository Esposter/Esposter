import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { DISPLAY_WIDTH } from "#src/services/genshinParity/passes/constants";
import { readOurFrame } from "#src/services/genshinParity/passes/readOurFrame";
import { readRawRgb } from "#src/services/genshinParity/shared/readRawRgb";

// The bloom's two frames of a reference, both at the display width: ours with the game's bloom drawn, and ours with it
// Off, the one prop the bloom reading varies, and the reference's own pixels at the same size
export const readBloomFrames = async (
  referenceId: string,
  component: DerivedAssetComponent,
): Promise<{ bloomed: Buffer; height: number; reference: Buffer; unbloomed: Buffer }> => {
  const bloomed = await readOurFrame(referenceId, component);
  const unbloomed = await readOurFrame(referenceId, component, { isBloomed: false });
  return {
    bloomed: bloomed.frame,
    height: bloomed.height,
    reference: await readRawRgb(bloomed.image, DISPLAY_WIDTH, bloomed.height),
    unbloomed: unbloomed.frame,
  };
};
