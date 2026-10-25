import { STRUCTURE_WIDTH } from "#src/services/genshinParity/shared/constants";

// How far, in pixels at the structure's width, an edge may sit from the other image's and still be the same edge
const EDGE_TOLERANCE = 2;

// Whether a mask has an edge within the tolerance of a pixel
export const checkHasEdgeNear = (edges: Uint8Array, x: number, y: number, height: number): boolean => {
  for (let dy = -EDGE_TOLERANCE; dy <= EDGE_TOLERANCE; dy++)
    for (let dx = -EDGE_TOLERANCE; dx <= EDGE_TOLERANCE; dx++) {
      const neighbourX = x + dx;
      const neighbourY = y + dy;
      if (neighbourX < 0 || neighbourY < 0 || neighbourX >= STRUCTURE_WIDTH || neighbourY >= height) continue;
      if (edges[neighbourY * STRUCTURE_WIDTH + neighbourX]) return true;
    }
  return false;
};
