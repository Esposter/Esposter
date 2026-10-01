import type { Page } from "playwright";

import { computeDistanceTransform } from "#src/services/genshinParity/computeDistanceTransform";
import { findPartBoundaries } from "#src/services/genshinParity/findPartBoundaries";
import { minimizeNelderMead } from "#src/services/genshinParity/minimizeNelderMead";
import { readStructureEdges } from "#src/services/genshinParity/readStructureEdges";
import { readWitnessGbuffer } from "#src/services/genshinParity/readWitnessGbuffer";
import { setPageWitnessView } from "#src/services/genshinParity/setPageWitnessView";
import { toPageCamera } from "#src/services/genshinParity/toPageCamera";

// The simplex's first steps along each axis, metres then degrees: a solved pose is within a few of these
const REFINE_STEPS = [0.05, 0.05, 0.05, 0.2, 0.2, 0.2];
// A pose refined from a solved one by a few steps of the simplex on the edges alone: the mean distance, in pixels at
// The page's size, from the witness's part boundaries (of the families given, from its part target rather than its
// Shading) to the reference's nearest edge, so the clouds, which draw no part, cannot pull it. It returns the pose and
// Its distance before and after
export const refineCameraPose = async (
  page: Page,
  image: Buffer,
  pose: readonly number[],
  families: readonly string[],
  iterationCount: number,
): Promise<{ after: number; before: number; pose: number[] }> => {
  const { height, width } = await readWitnessGbuffer(page);
  const edgeDistances = computeDistanceTransform(await readStructureEdges(image, height), width, height);
  const readDistance = async (candidate: readonly number[]): Promise<number> => {
    await setPageWitnessView(page, { camera: toPageCamera(candidate) });
    const gbuffer = await readWitnessGbuffer(page);
    const { familyIndices, mask } = findPartBoundaries(gbuffer);
    const familyIndexSet = new Set(families.map((family) => gbuffer.families.indexOf(family)));
    let sum = 0;
    let count = 0;
    for (const [pixel, isBoundary] of mask.entries())
      if (isBoundary && familyIndexSet.has(familyIndices[pixel] ?? -1)) {
        sum += edgeDistances[pixel] ?? 0;
        count++;
      }
    return count ? sum / count : Infinity;
  };
  const before = await readDistance(pose);
  const { cost, point } = await minimizeNelderMead(readDistance, pose, REFINE_STEPS, iterationCount);
  return { after: cost, before, pose: point };
};
