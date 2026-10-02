import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";

import { fetchReferences } from "#src/services/genshinParity/fetchReferences";
import { openWitnessPage } from "#src/services/genshinParity/openWitnessPage";
import { readFlipErrorMap } from "#src/services/genshinParity/readFlipErrorMap";
import { readWitnessPartTarget } from "#src/services/genshinParity/readWitnessPartTarget";
import { setPageWitnessView } from "#src/services/genshinParity/setPageWitnessView";
import { shootWitnessFamilies } from "#src/services/genshinParity/shootWitnessFamilies";
import { withFinalizerAsync } from "@esposter/shared";

// Wide enough that a tower's windows, its gold bands and the door's relief span several pixels
const STAND_IN_WIDTH = 960;
// Each family's stand-in against the game's own exports, both drawn by the one page at the reference's camera, moment,
// Light and haze: FLIP between the two over the exports' pixels of the family. A recording is soft, its light is ours
// To match and its parts never line up to the pixel, so a stand-in missing its windows, trims and carving scores
// Within noise of the exports against it; drawn beside the exports, every pixel lines up and only the stand-in differs.
// Each family's mean, and its ceiling as a share of the frame's pixels the same way rank's are
export const readStandInGains = async (
  referenceId: string,
  witness: DerivedAssetComponent,
): Promise<{ ceiling: number; mean: number; name: string; share: number }[]> => {
  await fetchReferences();
  const { browser, checkIsScored, height, page } = await openWitnessPage(referenceId, witness, STAND_IN_WIDTH);
  return withFinalizerAsync(
    async () => {
      const familyList = (await page.evaluate(() => window.document.body.dataset.witnessFamilies)) ?? "";
      const families = familyList.split(",").filter(Boolean);
      await setPageWitnessView(page, { families });
      const { families: layerFamilies, part, width } = await readWitnessPartTarget(page);
      const size = { height, width };
      const exportsShot = await shootWitnessFamilies(page, families, size);
      const ourShot = await shootWitnessFamilies(page, [], size);
      const { errorMap } = await readFlipErrorMap(exportsShot, ourShot, width, height);
      const terms = new Map<string, { count: number; error: number }>();
      let scoredCount = 0;
      for (const [pixel, error] of errorMap.entries()) {
        if (!checkIsScored(pixel, width)) continue;
        scoredCount++;
        if (!part[pixel * 4]) continue;
        const name = layerFamilies[part[pixel * 4 + 1] ?? 0] ?? "unnamed";
        const term = terms.get(name) ?? { count: 0, error: 0 };
        term.count++;
        term.error += error;
        terms.set(name, term);
      }
      return Array.from(terms, ([name, { count, error }]) => ({
        ceiling: error / Math.max(scoredCount, 1),
        mean: error / Math.max(count, 1),
        name,
        share: count / Math.max(scoredCount, 1),
      })).toSorted((first, second) => second.ceiling - first.ceiling);
    },
    () => browser.close(),
  );
};
