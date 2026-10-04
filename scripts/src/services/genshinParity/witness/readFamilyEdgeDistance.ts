import type { Page } from "playwright";

import { readWitnessPartTarget } from "#src/services/genshinParity/shared/readWitnessPartTarget";
import { findFamilyBoundaries } from "#src/services/genshinParity/witness/findFamilyBoundaries";

// The witness's view as last set, priced on a reference's edges: the mean distance, in pixels at the page's size, from
// The given families' boundaries in its part target (rather than its shading, so the clouds, which draw no part, cannot
// Pull it) to the reference's nearest edge, from the pixel given on
export const readFamilyEdgeDistance = async (
  page: Page,
  { edgeDistances, families, topPixel }: { edgeDistances: Float32Array; families: readonly string[]; topPixel: number },
): Promise<number> => {
  const gbuffer = await readWitnessPartTarget(page);
  const { familyIndices, mask } = findFamilyBoundaries(gbuffer);
  const familyIndexSet = new Set(families.map((family) => gbuffer.families.indexOf(family)));
  let sum = 0;
  let count = 0;
  for (const [pixel, isBoundary] of mask.entries())
    if (isBoundary && pixel >= topPixel && familyIndexSet.has(familyIndices[pixel] ?? -1)) {
      sum += edgeDistances[pixel] ?? 0;
      count++;
    }
  return count ? sum / count : Infinity;
};
