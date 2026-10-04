import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";

import { CLOUDS_WIDTH } from "#src/services/genshinParity/constants";
import { fetchReferences } from "#src/services/genshinParity/fetchReferences";
import { minimizeNelderMead } from "#src/services/genshinParity/minimizeNelderMead";
import { openWitnessPage } from "#src/services/genshinParity/openWitnessPage";
import { readCloudSky } from "#src/services/genshinParity/readCloudSky";
import { setPageWitnessView } from "#src/services/genshinParity/setPageWitnessView";
import { withFinalizerAsync } from "@esposter/shared";

type SetCloudCover = (covers?: Record<string, number>) => string[];
// Each share starts at three in four, the simplex's first step in its logit as wide as from there to even odds and
// Past: the cover steps by whole clouds, so a search with no gradient finds its way where a descent's Jacobian stalls
const START_LOGIT = Math.log(3);
const LOGIT_STEP = 1.5;
const ITERATION_COUNT = 40;
const toShare = (logit: number): number => 1 / (1 + Math.exp(-logit));
// The share of each band's clouds the scene should draw at a reference's hour, by the sky's cover band by band of its
// Height over the horizon: our sky drawn at each guess and its clouds read as the reference's are (`readCloudSky`),
// At the reference's own split between cloud and clear sky,
// The shares solved by the simplex in their logits so each stays between none and all. A cloud standing
// Elsewhere than the reference's costs nothing here, where a score comparing pixels charges it twice, so the cover is
// Matched in kind rather than in place
export const solveReferenceCloudCover = async (
  referenceId: string,
  witness: DerivedAssetComponent,
): Promise<{ covers: Record<string, number>; ours: number[]; reference: number[]; residual: number }> => {
  await fetchReferences();
  const { browser, checkIsScored, height, image, page } = await openWitnessPage(referenceId, witness, CLOUDS_WIDTH);
  return withFinalizerAsync(
    async () => {
      const { readClouds, readCloudThreshold, readElevationCoverage, readLuminance } = await readCloudSky(page, {
        checkIsScored,
        height,
      });
      const referenceLuminance = await readLuminance(image);
      // Our clouds are read at the reference's split: split on our own render, each guess moved the split with its
      // Clouds, and the solve chased a cost that moved under it
      const threshold = readCloudThreshold(referenceLuminance);
      const reference = readElevationCoverage(readClouds(referenceLuminance, threshold));
      const bands = await page.evaluate(() => (Reflect.get(window, "setSceneCloudCover") as SetCloudCover)());
      const toCovers = (logits: readonly number[]): Record<string, number> =>
        Object.fromEntries(bands.map((band, index) => [band, toShare(logits[index] ?? 0)]));
      const readOurs = async (logits: readonly number[]): Promise<number[]> => {
        await page.evaluate(
          (covers) => (Reflect.get(window, "setSceneCloudCover") as SetCloudCover)(covers),
          toCovers(logits),
        );
        await setPageWitnessView(page, { families: [] });
        return readElevationCoverage(readClouds(await readLuminance(await page.screenshot()), threshold));
      };
      const { cost, point } = await minimizeNelderMead(
        async (logits) =>
          (await readOurs(logits)).reduce((sum, value, index) => sum + (value - (reference[index] ?? 0)) ** 2, 0),
        bands.map(() => START_LOGIT),
        bands.map(() => LOGIT_STEP),
        ITERATION_COUNT,
      );
      const ours = await readOurs(point);
      await page.evaluate(() => (Reflect.get(window, "setSceneCloudCover") as SetCloudCover)());
      return { covers: toCovers(point), ours, reference, residual: Math.sqrt(cost / Math.max(reference.length, 1)) };
    },
    () => browser.close(),
  );
};
