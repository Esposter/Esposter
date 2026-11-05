import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { DISPLAY_WIDTH } from "#src/services/genshinParity/passes/constants";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { readRawRgb } from "#src/services/genshinParity/shared/readRawRgb";
import { setPageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";
import { withFinalizerAsync } from "@esposter/shared";

// Our frame of a reference's screen at the display width, drawn with the reference's props and the ones given over them,
// its parts our own (no export drawn in place of one, as `readSky` shoots its frame), read as raw RGB
const readOurFrame = async (
  referenceId: string,
  component: DerivedAssetComponent,
  propOverrides?: Record<string, unknown>,
): Promise<{ frame: Buffer; height: number; image: Buffer }> => {
  const { close, height, image, page } = await openWitnessPage(
    referenceId,
    component,
    DISPLAY_WIDTH,
    undefined,
    propOverrides,
  );
  return withFinalizerAsync(
    async () => {
      await setPageWitnessView(page, { families: [] });
      return { frame: await readRawRgb(await page.screenshot(), DISPLAY_WIDTH, height), height, image };
    },
    () => close(),
  );
};

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
