import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { DISPLAY_WIDTH } from "#src/services/genshinParity/passes/constants";
import { readOurFrame } from "#src/services/genshinParity/passes/readOurFrame";
import { readRawRgb } from "#src/services/genshinParity/shared/readRawRgb";

// The bloom's two frames of a reference, both at the display width: ours with the game's bloom drawn, and ours with it
// Off, the one prop the bloom reading varies. The drawn frame leaves the switch undefined, which the page sends as no prop,
// So a reference that turns the bloom off still draws it there, and the reference's own pixels at the same size
export const readBloomFrames = async (
  referenceId: string,
  component: DerivedAssetComponent,
): Promise<{ bloomed: Buffer; height: number; reference: Buffer; unbloomed: Buffer }> => {
  const bloomed = await readOurFrame(referenceId, component, { isBloomed: undefined });
  const unbloomed = await readOurFrame(referenceId, component, { isBloomed: false });
  return {
    bloomed: bloomed.frame,
    height: bloomed.height,
    reference: await readRawRgb(bloomed.image, DISPLAY_WIDTH, bloomed.height),
    unbloomed: unbloomed.frame,
  };
};
