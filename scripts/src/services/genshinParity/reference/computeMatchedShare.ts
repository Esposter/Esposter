import { checkHasEdgeNear } from "#src/services/genshinParity/reference/checkHasEdgeNear";
import { STRUCTURE_WIDTH } from "#src/services/genshinParity/shared/constants";

// The share of one mask's edges with an edge of the other within the tolerance, over the pixels a layer covers
export const computeMatchedShare = (
  edges: Uint8Array,
  otherEdges: Uint8Array,
  height: number,
  layer: Uint8Array | undefined,
): number => {
  let count = 0;
  let matched = 0;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < STRUCTURE_WIDTH; x++) {
      if (!edges[y * STRUCTURE_WIDTH + x] || (layer && !layer[y * STRUCTURE_WIDTH + x])) continue;
      count++;
      if (checkHasEdgeNear(otherEdges, x, y, height)) matched++;
    }
  return count === 0 ? 0 : matched / count;
};
