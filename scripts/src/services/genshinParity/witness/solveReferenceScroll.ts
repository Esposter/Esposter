import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { solveReferenceCamera } from "#src/services/genshinParity/passes/solveReferenceCamera";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { setPageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";
import { toPageCamera } from "#src/services/genshinParity/shared/toPageCamera";
import { computeMaskedMean } from "#src/services/genshinParity/witness/computeMaskedMean";
import { readFamilyBoundaries } from "#src/services/genshinParity/witness/readFamilyBoundaries";
import { readFamilyEdgeDistances } from "#src/services/genshinParity/witness/readFamilyEdgeDistances";
import { withFinalizerAsync } from "@esposter/shared";

// How far the scene's scrolling rows stood from where it draws them in a reference's state, along the glide, read off
// The reference's edges: at its camera (`solveReferenceCamera`), the witness's families given moved together along the
// Glide by each distance of the scan, and priced on the mean distance from their boundaries to the reference's nearest
// Edge (`readFamilyEdgeDistances`). Each distance comes back with its price; a row moved ahead by a distance stands
// Where the scene's glide would have scrolled that much less
export const solveReferenceScroll = async (
  referenceId: string,
  component: DerivedAssetComponent,
  families: readonly string[],
  offsets: readonly number[],
): Promise<{ distance: number; offset: number }[]> => {
  await fetchReferences();
  const { browser, image, page } = await openWitnessPage(referenceId, component);
  return withFinalizerAsync(
    async () => {
      const { pose } = await solveReferenceCamera(page, referenceId, component);
      const camera = toPageCamera(pose);
      await setPageWitnessView(page, { camera });
      const { edgeDistances } = await readFamilyEdgeDistances(page, image, families, 0);
      const readings: { distance: number; offset: number }[] = [];
      for (const offset of offsets) {
        // oxlint-disable-next-line no-await-in-loop -- each distance is drawn on the one page in turn
        await setPageWitnessView(page, {
          camera,
          familyOffsets: Object.fromEntries(
            families.map((family): [string, [number, number, number]] => [family, [0, 0, offset]]),
          ),
        });
        // oxlint-disable-next-line no-await-in-loop -- read after the view it drew
        const boundaries = await readFamilyBoundaries(page, families, 0);
        readings.push({ distance: computeMaskedMean(boundaries, edgeDistances), offset });
      }
      return readings;
    },
    () => browser.close(),
  );
};
