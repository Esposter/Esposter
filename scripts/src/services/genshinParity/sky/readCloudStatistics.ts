import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { SkyDistance } from "#src/models/genshinParity/sky/SkyDistance";
import type { SkyStatistics } from "#src/models/genshinParity/sky/SkyStatistics";

import { CLOUDS_WIDTH } from "#src/services/genshinParity/shared/constants";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { readSkyComparison } from "#src/services/genshinParity/sky/readSkyComparison";
import { writeCloudSheet } from "#src/services/genshinParity/sky/writeCloudSheet";
import { withFinalizerAsync } from "@esposter/shared";

// A reference's sky and the scene's as statistics blind to where their clouds stand (`readSkyComparison`): each one's,
// How far ours stands from the reference's, the spread two halves of the reference's own sky stand apart, and how many
// Pixels of sky they are read over. Each frame is written beside its clouds, the reference's over ours, for the eye
export const readCloudStatistics = async (
  referenceId: string,
  witness: DerivedAssetComponent,
): Promise<{
  distance: SkyDistance;
  ours: SkyStatistics;
  reference: SkyStatistics;
  skyCount: number;
  spread: SkyDistance;
}> => {
  await fetchReferences();
  const { close, checkIsScored, height, image, page } = await openWitnessPage(referenceId, witness, CLOUDS_WIDTH);
  return withFinalizerAsync(
    async () => {
      const { compareShot, reference, referenceClouds, sky, spread } = await readSkyComparison(
        page,
        referenceId,
        witness,
        { checkIsScored, height, image },
      );
      const ourShot = await page.screenshot();
      const { clouds: ourClouds, distance, statistics } = await compareShot(ourShot);
      await writeCloudSheet(`${referenceId}.clouds`, {
        height,
        ourClouds,
        ourShot,
        referenceClouds,
        referenceImage: image,
        sky,
      });
      return { distance, ours: statistics, reference, skyCount: sky.reduce((sum, isSky) => sum + isSky, 0), spread };
    },
    () => close(),
  );
};
