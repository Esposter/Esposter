import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { RadianceFrames } from "#src/models/genshinParity/radiance/RadianceFrames";

import { WitnessTargetName } from "#src/models/genshinParity/shared/WitnessTargetName";
import { DISPLAY_WIDTH, SHAPE_WIDTH } from "#src/services/genshinParity/passes/constants";
import { getReferenceCameraPose } from "#src/services/genshinParity/passes/getReferenceCameraPose";
import { readTargetFamily } from "#src/services/genshinParity/passes/readTargetFamily";
import { solveReferenceCamera } from "#src/services/genshinParity/passes/solveReferenceCamera";
import { resampleNearest } from "#src/services/genshinParity/radiance/resampleNearest";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { readRawRgb } from "#src/services/genshinParity/shared/readRawRgb";
import { readWitnessTargets } from "#src/services/genshinParity/shared/readWitnessTargets";
import { setPageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";
import { toPageCamera } from "#src/services/genshinParity/shared/toPageCamera";
import { withFinalizerAsync } from "@esposter/shared";

// One reference's two frames at the display width, both resized from the shape's width by the same lanczos3 kernel, and
// The masks read over them: the family each pixel's export part draws, and our render's share of the sun. Both are read
// At the camera the reference records, solved for it as the exports are, and at the scene's own camera where it records
// None, as `compare` shoots it. The bloom is off, as the frames are read for the scene's light
export const readRadianceFrames = async (
  referenceId: string,
  component: DerivedAssetComponent,
  pageRoot?: string,
): Promise<RadianceFrames> => {
  const openedPage = await openWitnessPage(
    referenceId,
    component,
    SHAPE_WIDTH,
    undefined,
    { isBloomed: false },
    pageRoot,
  );
  return withFinalizerAsync(
    async () => {
      const { checkIsScored, height, image, page } = openedPage;
      const camera = getReferenceCameraPose(referenceId)
        ? toPageCamera((await solveReferenceCamera(page, referenceId, component)).pose)
        : undefined;
      await setPageWitnessView(page, { camera, isAlone: true });
      const exportsRead = await readWitnessTargets(page, [WitnessTargetName.Part]);
      await setPageWitnessView(page, { camera, families: [] });
      const oursRead = await readWitnessTargets(page, [WitnessTargetName.Shadow], true);
      const oursShot = await page.screenshot();
      const part = exportsRead.targets.part ?? new Float32Array();
      const shadow = oursRead.targets.shadow ?? new Float32Array();
      const { width: sourceWidth } = exportsRead;
      const sourceHeight = part.length / 4 / sourceWidth;
      const pixelCount = sourceWidth * sourceHeight;
      const displayHeight = Math.round((DISPLAY_WIDTH * height) / sourceWidth);
      const familyIndices = Float32Array.from({ length: pixelCount }, (_value, pixel) => readTargetFamily(part, pixel));
      const shadowShare = Float32Array.from({ length: pixelCount }, (_value, pixel) => shadow[pixel * 4] ?? 0);
      return {
        families: exportsRead.families,
        family: resampleNearest(familyIndices, sourceWidth, sourceHeight, DISPLAY_WIDTH, displayHeight),
        height: displayHeight,
        ours: await readRawRgb(oursShot, DISPLAY_WIDTH, displayHeight),
        reference: await readRawRgb(image, DISPLAY_WIDTH, displayHeight),
        scored: Uint8Array.from({ length: DISPLAY_WIDTH * displayHeight }, (_value, pixel) =>
          Number(checkIsScored(pixel, DISPLAY_WIDTH)),
        ),
        shadow: resampleNearest(shadowShare, sourceWidth, sourceHeight, DISPLAY_WIDTH, displayHeight),
        width: DISPLAY_WIDTH,
      };
    },
    () => openedPage.close(),
  );
};
