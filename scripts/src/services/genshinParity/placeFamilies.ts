import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import type { PageWitnessView } from "#src/services/genshinParity/setPageWitnessView";

import { computeDistanceTransform } from "#src/services/genshinParity/computeDistanceTransform";
import { STRUCTURE_WIDTH } from "#src/services/genshinParity/constants";
import { fetchReferences } from "#src/services/genshinParity/fetchReferences";
import { minimizeNelderMead } from "#src/services/genshinParity/minimizeNelderMead";
import { openWitnessPage } from "#src/services/genshinParity/openWitnessPage";
import { readFamilyEdgeDistance } from "#src/services/genshinParity/readFamilyEdgeDistance";
import { readStructureEdges } from "#src/services/genshinParity/readStructureEdges";
import { setPageWitnessView } from "#src/services/genshinParity/setPageWitnessView";
import { withFinalizerAsync } from "@esposter/shared";

// The simplex's first step along each axis, in metres: an arrangement off by a lost anchor's height is off by a few
const PLACE_STEP = 0.5;
// Where a group of families stands on a reference, with the camera held at the reference's own view or the pose given:
// One offset in three's axes shared by every family named (a row the script moves as one), refined by the simplex on
// Those families' edges alone, from their laid-out places, so an arrangement's lost height or depth is read off the
// Reference rather than guessed. The rest of the exports stay where they are laid out, and the camera, solved on
// Them, stays put; only the boundaries from the row given down are priced
export const placeFamilies = async (
  referenceId: string,
  witness: DerivedAssetComponent,
  {
    camera,
    families,
    iterationCount,
    topRow = 0,
  }: { camera?: PageWitnessView["camera"]; families: readonly string[]; iterationCount: number; topRow?: number },
): Promise<{ after: number; before: number; offset: [number, number, number] }> => {
  await fetchReferences();
  const { browser, height, image, page } = await openWitnessPage(referenceId, witness);
  return withFinalizerAsync(
    async () => {
      const topPixel = Math.round(topRow) * STRUCTURE_WIDTH;
      const edges = (await readStructureEdges(image, height)).fill(0, 0, topPixel);
      const edgeDistances = computeDistanceTransform(edges, STRUCTURE_WIDTH, height);
      const readDistance = async ([x = 0, y = 0, z = 0]: readonly number[]): Promise<number> => {
        const offset: [number, number, number] = [x, y, z];
        await setPageWitnessView(page, {
          camera,
          familyOffsets: Object.fromEntries(families.map((family) => [family, offset])),
        });
        return readFamilyEdgeDistance(page, { edgeDistances, families, topPixel });
      };
      const before = await readDistance([0, 0, 0]);
      const {
        cost,
        point: [x = 0, y = 0, z = 0],
      } = await minimizeNelderMead(readDistance, [0, 0, 0], [PLACE_STEP, PLACE_STEP, PLACE_STEP], iterationCount);
      return { after: cost, before, offset: [x, y, z] };
    },
    () => browser.close(),
  );
};
