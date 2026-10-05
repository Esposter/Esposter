import type { Page } from "playwright";

import { readStructureEdges } from "#src/services/genshinParity/shared/readStructureEdges";
import { readWitnessPartTarget } from "#src/services/genshinParity/shared/readWitnessPartTarget";
import { computeDistanceTransform } from "#src/services/genshinParity/witness/computeDistanceTransform";
import { InvalidOperationError, Operation } from "@esposter/shared";

// What a pose or a placement of the families given is priced on: each pixel's distance to the reference's nearest edge,
// Its edges read at the witness's drawing buffer's size (which the page's whole-pixel viewport can leave a pixel off
// The structure's width) so a pixel's index is the same in both, and the first pixel of the row given, above which no
// Edge is priced. Each family must be one the witness draws, which would otherwise price no boundary at all
export const readFamilyEdgeDistances = async (
  page: Page,
  image: Buffer,
  families: readonly string[],
  topRow: number,
): Promise<{ edgeDistances: Float32Array; edges: Uint8Array; height: number; topPixel: number; width: number }> => {
  const { families: drawnFamilies, height, width } = await readWitnessPartTarget(page);
  if (families.length === 0) throw new InvalidOperationError(Operation.Read, "families", "none given to price");
  for (const family of families)
    if (!drawnFamilies.includes(family))
      throw new InvalidOperationError(
        Operation.Read,
        family,
        `not a family the witness draws: ${drawnFamilies.join(", ")}`,
      );
  // A row above a crop's top comes in negative, which fill would count from the end
  const topPixel = Math.max(0, Math.ceil(topRow)) * width;
  // The reference's edges above the row are cleared too, so none of them is the nearest to a boundary below it
  const edges = (await readStructureEdges(image, height, width)).fill(0, 0, topPixel);
  return { edgeDistances: computeDistanceTransform(edges, width, height), edges, height, topPixel, width };
};
