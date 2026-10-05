import type { Page } from "playwright";

import { readWitnessPartTarget } from "#src/services/genshinParity/shared/readWitnessPartTarget";
import { findFamilyBoundaries } from "#src/services/genshinParity/witness/findFamilyBoundaries";

// The given families' boundaries in the witness's view as last set, from the pixel given on, as a mask: read off its
// Part target rather than its shading, so the clouds, which draw no part, cannot move them
export const readFamilyBoundaries = async (
  page: Page,
  families: readonly string[],
  topPixel: number,
): Promise<Uint8Array> => {
  const gbuffer = await readWitnessPartTarget(page);
  const { familyIndices, mask } = findFamilyBoundaries(gbuffer);
  const familyIndexSet = new Set(families.map((family) => gbuffer.families.indexOf(family)));
  return mask.map((isBoundary, pixel) =>
    isBoundary && pixel >= topPixel && familyIndexSet.has(familyIndices[pixel] ?? -1) ? 1 : 0,
  );
};
