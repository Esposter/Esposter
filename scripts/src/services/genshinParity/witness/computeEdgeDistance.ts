import { computeDistanceTransform } from "#src/services/genshinParity/witness/computeDistanceTransform";
import { computeMaskedMean } from "#src/services/genshinParity/witness/computeMaskedMean";

// How far two masks' edges lie apart, in pixels: each edge pixel's distance to the other mask's nearest, averaged over
// Each mask and the two means averaged, so drawing more edges or fewer than the other gains nothing. A caller pricing
// Many edges against one other passes that other's distance transform, built once rather than on each price
export const computeEdgeDistance = (
  edges: Uint8Array,
  otherEdges: Uint8Array,
  width: number,
  height: number,
  otherDistances = computeDistanceTransform(otherEdges, width, height),
): number =>
  (computeMaskedMean(edges, otherDistances) +
    computeMaskedMean(otherEdges, computeDistanceTransform(edges, width, height))) /
  2;
