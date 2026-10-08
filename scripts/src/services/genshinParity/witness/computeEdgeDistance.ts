import { computeDistanceTransform } from "#src/services/genshinParity/witness/computeDistanceTransform";

// The mean of a distance map over a mask's pixels, as far as can be where the mask holds none
const readMaskMean = (mask: Uint8Array, distances: Float32Array): number => {
  let [sum, count] = [0, 0];
  for (const [pixel, isSet] of mask.entries())
    if (isSet) {
      sum += distances[pixel] ?? 0;
      count++;
    }
  return count > 0 ? sum / count : Infinity;
};
// How far two masks' edges lie apart, in pixels: each edge pixel's distance to the other mask's nearest, averaged over
// Each mask and the two means averaged, so drawing more edges or fewer than the other gains nothing
export const computeEdgeDistance = (edges: Uint8Array, otherEdges: Uint8Array, width: number, height: number): number =>
  (readMaskMean(edges, computeDistanceTransform(otherEdges, width, height)) +
    readMaskMean(otherEdges, computeDistanceTransform(edges, width, height))) /
  2;
