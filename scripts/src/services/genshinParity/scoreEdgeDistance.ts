import { computeDistanceTransform } from "#src/services/genshinParity/computeDistanceTransform";
import { STRUCTURE_WIDTH } from "#src/services/genshinParity/constants";
import { readStructureEdges } from "#src/services/genshinParity/readStructureEdges";
import sharp from "sharp";

// How far each image's edges sit from the other's, as the mean over both of an edge's distance to the nearest edge of
// The other image, in pixels at the structure's width. Unlike the shape score's count of edges within a tolerance, it
// Falls smoothly as two images come into register, which is what a search for a camera pose needs to descend
export const scoreEdgeDistance = async (reference: Buffer, ours: Buffer): Promise<number> => {
  const { height: referenceHeight, width: referenceWidth } = await sharp(reference).metadata();
  const height = Math.round((STRUCTURE_WIDTH / referenceWidth) * referenceHeight);
  const [referenceEdges, ourEdges] = await Promise.all([
    readStructureEdges(reference, height),
    readStructureEdges(ours, height),
  ]);
  const readMeanDistance = (edges: Uint8Array, otherEdges: Uint8Array): number => {
    const distances = computeDistanceTransform(otherEdges, STRUCTURE_WIDTH, height);
    let sum = 0;
    let count = 0;
    for (const [index, isEdge] of edges.entries()) {
      if (!isEdge) continue;
      sum += distances[index] ?? 0;
      count++;
    }
    return count === 0 ? STRUCTURE_WIDTH : sum / count;
  };
  return (readMeanDistance(referenceEdges, ourEdges) + readMeanDistance(ourEdges, referenceEdges)) / 2;
};
