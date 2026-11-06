import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { DISPLAY_WIDTH } from "#src/services/genshinParity/passes/constants";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { readRawRgb } from "#src/services/genshinParity/shared/readRawRgb";
import { setPageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";
import { withFinalizerAsync } from "@esposter/shared";

// Our frame of a reference's screen at the display width, drawn with the reference's props and the ones given over them,
// Its parts our own (no export drawn in place of one, as `readSky` shoots its frame), read as raw RGB
export const readOurFrame = async (
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
