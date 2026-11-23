import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { DISPLAY_WIDTH } from "#src/services/genshinParity/passes/constants";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { readRawRgb } from "#src/services/genshinParity/shared/readRawRgb";
import { setPageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";
import { withFinalizerAsync } from "@esposter/shared";

// Our frame of a reference's screen at the display width, drawn with the reference's props and the ones given over
// Them, Its parts our own (no export drawn in place of one, as `readSky` shoots its frame), read as raw RGB. The page
// Is drawn At `pageWidth`, which is the display width unless a caller draws it larger and resizes it down, and `image`
// Is the Reference at that width, so the caller resizes both sides the same way
export const readOurFrame = async (
  referenceId: string,
  component: DerivedAssetComponent,
  propOverrides?: Record<string, unknown>,
  pageRoot?: string,
  pageWidth: number = DISPLAY_WIDTH,
): Promise<{ frame: Buffer; height: number; image: Buffer }> => {
  const { close, height, image, page } = await openWitnessPage(
    referenceId,
    component,
    pageWidth,
    undefined,
    propOverrides,
    pageRoot,
  );
  return withFinalizerAsync(
    async () => {
      await setPageWitnessView(page, { families: [] });
      const displayHeight = Math.round((DISPLAY_WIDTH * height) / pageWidth);
      return {
        frame: await readRawRgb(await page.screenshot(), DISPLAY_WIDTH, displayHeight),
        height: displayHeight,
        image,
      };
    },
    () => close(),
  );
};
