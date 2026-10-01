import type { StructureScores } from "#src/models/genshinParity/StructureScores";

import { STRUCTURE_WIDTH } from "#src/services/genshinParity/constants";
import { readStructureEdges } from "#src/services/genshinParity/readStructureEdges";
import sharp from "sharp";

// The blur the tone is read through: the size of a pillar at the structure's width, so only light and colour are left
const TONE_BLUR_SIGMA = 8;
// How far, in pixels at the structure's width, an edge may sit from the other image's and still be the same edge
const EDGE_TOLERANCE = 2;
// Whether a mask has an edge within the tolerance of a pixel
const checkHasEdgeNear = (edges: Uint8Array, x: number, y: number, height: number): boolean => {
  for (let dy = -EDGE_TOLERANCE; dy <= EDGE_TOLERANCE; dy++)
    for (let dx = -EDGE_TOLERANCE; dx <= EDGE_TOLERANCE; dx++) {
      const neighbourX = x + dx;
      const neighbourY = y + dy;
      if (neighbourX < 0 || neighbourY < 0 || neighbourX >= STRUCTURE_WIDTH || neighbourY >= height) continue;
      if (edges[neighbourY * STRUCTURE_WIDTH + neighbourX]) return true;
    }
  return false;
};
// The share of one mask's edges with an edge of the other within the tolerance, over the pixels a layer covers
const readMatchedShare = (
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
// How alike two images are where a pixel mean cannot say, as for a scene rebuilt from shapes rather than copied: the
// Shape is the edges they share, as an F-score of each one's edges found in the other, and the tone is the mean
// Difference of their colour blurred past any texture, as a percentage. Given a layer, a mask at the structure's width,
// Both are read over its pixels alone
export const scoreStructure = async (reference: Buffer, ours: Buffer, layer?: Uint8Array): Promise<StructureScores> => {
  const { height: referenceHeight, width: referenceWidth } = await sharp(reference).metadata();
  const height = Math.round((STRUCTURE_WIDTH / referenceWidth) * referenceHeight);
  const [referenceEdges, ourEdges] = await Promise.all([
    readStructureEdges(reference, height),
    readStructureEdges(ours, height),
  ]);
  const precision = readMatchedShare(ourEdges, referenceEdges, height, layer);
  const recall = readMatchedShare(referenceEdges, ourEdges, height, layer);
  const edgeScore = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  const readTone = (input: Buffer) =>
    sharp(input).resize(STRUCTURE_WIDTH, height, { fit: "fill" }).removeAlpha().blur(TONE_BLUR_SIGMA).raw().toBuffer();
  const [referenceTone, ourTone] = await Promise.all([readTone(reference), readTone(ours)]);
  let toneSum = 0;
  let toneCount = 0;
  for (let index = 0; index < referenceTone.length; index++) {
    if (layer && !layer[Math.floor(index / 3)]) continue;
    toneSum += Math.abs((referenceTone[index] ?? 0) - (ourTone[index] ?? 0));
    toneCount++;
  }
  return { edgeScore, toneDifference: (toneSum / Math.max(toneCount, 1) / 255) * 100 };
};
