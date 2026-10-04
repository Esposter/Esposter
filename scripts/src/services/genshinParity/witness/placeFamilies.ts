import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { PageWitnessView } from "#src/models/genshinParity/shared/PageWitnessView";

import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { minimizeNelderMead } from "#src/services/genshinParity/shared/minimizeNelderMead";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { readWitnessPartTarget } from "#src/services/genshinParity/shared/readWitnessPartTarget";
import { setPageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";
import { computeDistanceTransform } from "#src/services/genshinParity/witness/computeDistanceTransform";
import { findFamilyBoundaries } from "#src/services/genshinParity/witness/findFamilyBoundaries";
import { readFamilyEdgeDistances } from "#src/services/genshinParity/witness/readFamilyEdgeDistances";
import { withFinalizerAsync } from "@esposter/shared";

const computeMean = (from: Uint8Array, distances: Float32Array): number => {
  let sum = 0;
  let count = 0;
  for (const [pixel, isSet] of from.entries())
    if (isSet) {
      sum += distances[pixel] ?? 0;
      count++;
    }
  return count ? sum / count : Infinity;
};
// Where a group of families stands on a reference, with the camera held at the reference's own view or the pose given:
// One offset in three's axes shared by every family named (a row the script moves as one), refined by the simplex on
// Those families' edges both ways, from their laid-out places, so an arrangement's lost height or depth is read off
// The reference rather than guessed: the families' boundaries' mean distance to the reference's edges, and the
// Reference's edges' to the boundaries, those edges taken where the other families (solved already) do not stand.
// One way alone rewards drawing less, a phase that carries every near part away scoring best. The rest of the exports
// Stay where they are laid out, and the camera, solved on them, stays put; only from the row given down is priced
export const placeFamilies = async (
  referenceId: string,
  witness: DerivedAssetComponent,
  {
    camera,
    families,
    iterationCount,
    scan,
    start: given = [0, 0, 0],
    step,
    topRow = 0,
  }: {
    camera?: PageWitnessView["camera"];
    families: readonly string[];
    iterationCount: number;
    // A period the families repeat along one axis (a row the script scrolls), read at every step of it first, the
    // Simplex starting from its best: the families' own edges at each phase, the only unknown left once the camera is
    // Solved on the parts that do not scroll
    scan?: { axis: 0 | 1 | 2; from: number; step: number; to: number };
    // Where the refinement starts, a phase read off the parts the reference shows
    start?: [number, number, number];
    // The simplex's first step along each axis, in metres, about as far as the families may stand off
    step: number;
    topRow?: number;
  },
): Promise<{ after: number; before: number; offset: [number, number, number] }> => {
  await fetchReferences();
  const { browser, image, page } = await openWitnessPage(referenceId, witness);
  return withFinalizerAsync(
    async () => {
      const { edgeDistances, edges, height, topPixel, width } = await readFamilyEdgeDistances(
        page,
        image,
        families,
        topRow,
      );
      // The reference's edges where none of the other families stands, which the families placed must account for
      await setPageWitnessView(page, { camera });
      const laidOut = await readWitnessPartTarget(page);
      const familyIndexSet = new Set(families.map((family) => laidOut.families.indexOf(family)));
      const freeEdges = edges.map((edge, pixel) => {
        const isOtherFamily = laidOut.part[pixel * 4] && !familyIndexSet.has(laidOut.part[pixel * 4 + 1] ?? -1);
        return edge && !isOtherFamily ? 1 : 0;
      });
      const readDistance = async ([x = 0, y = 0, z = 0]: readonly number[]): Promise<number> => {
        const offset: [number, number, number] = [x, y, z];
        await setPageWitnessView(page, {
          camera,
          familyOffsets: Object.fromEntries(families.map((family) => [family, offset])),
        });
        const gbuffer = await readWitnessPartTarget(page);
        const { familyIndices, mask } = findFamilyBoundaries(gbuffer);
        const boundaries = mask.map((isBoundary, pixel) =>
          isBoundary && pixel >= topPixel && familyIndexSet.has(familyIndices[pixel] ?? -1) ? 1 : 0,
        );
        const boundaryDistances = computeDistanceTransform(boundaries, width, height);
        return (computeMean(boundaries, edgeDistances) + computeMean(freeEdges, boundaryDistances)) / 2;
      };
      const before = await readDistance([0, 0, 0]);
      let start: number[] = given;
      if (scan) {
        let best = await readDistance(start);
        for (let phase = scan.from; phase <= scan.to; phase += scan.step) {
          const candidate = start.map((value, axis) => (axis === scan.axis ? phase : value));
          // oxlint-disable-next-line no-await-in-loop -- one phase is drawn and priced after another
          const distance = await readDistance(candidate);
          console.log(`${["x", "y", "z"][scan.axis]} ${phase.toFixed(2)}: ${distance.toFixed(3)} px`);
          if (distance < best) {
            best = distance;
            start = candidate;
          }
        }
      }
      const {
        cost,
        point: [x = 0, y = 0, z = 0],
      } = await minimizeNelderMead(readDistance, start, [step, step, step], iterationCount);
      return { after: cost, before, offset: [x, y, z] };
    },
    () => browser.close(),
  );
};
