import type { StructureScores } from "#src/models/genshinParity/StructureScores";

import sharp from "sharp";

// Both images are read at this width, small enough that a scene's texture is gone and its shapes and light remain
const STRUCTURE_WIDTH = 480;
// The blur the tone is read through: the size of a pillar at this width, so only light and colour are left
const TONE_BLUR_SIGMA = 8;
// An edge is the strongest tenth of either image's gradients, so a darker or softer image still has as many
const EDGE_SHARE = 0.1;
// How far, in pixels at the structure's width, an edge may sit from the other image's and still be the same edge
const EDGE_TOLERANCE = 2;

const readGrey = async (input: Buffer, height: number): Promise<Float32Array> => {
  const { data } = await sharp(input)
    .resize(STRUCTURE_WIDTH, height, { fit: "fill" })
    .greyscale()
    .blur(1)
    .raw()
    .toBuffer({ resolveWithObject: true });
  return Float32Array.from(data);
};
// The strongest gradients of an image, by Sobel, as a mask of its pixels
const readEdges = (grey: Float32Array, height: number): Uint8Array => {
  const magnitudes = new Float32Array(grey.length);
  for (let y = 1; y < height - 1; y++)
    for (let x = 1; x < STRUCTURE_WIDTH - 1; x++) {
      const at = (dx: number, dy: number) => grey[(y + dy) * STRUCTURE_WIDTH + x + dx] ?? 0;
      const gx = at(1, -1) + 2 * at(1, 0) + at(1, 1) - at(-1, -1) - 2 * at(-1, 0) - at(-1, 1);
      const gy = at(-1, 1) + 2 * at(0, 1) + at(1, 1) - at(-1, -1) - 2 * at(0, -1) - at(1, -1);
      magnitudes[y * STRUCTURE_WIDTH + x] = Math.hypot(gx, gy);
    }
  const sorted = magnitudes.toSorted();
  const threshold = sorted[Math.floor(sorted.length * (1 - EDGE_SHARE))] ?? 0;
  return Uint8Array.from(magnitudes, (magnitude) => (magnitude > 0 && magnitude >= threshold ? 1 : 0));
};
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
// The share of one mask's edges with an edge of the other within the tolerance
const readMatchedShare = (edges: Uint8Array, otherEdges: Uint8Array, height: number): number => {
  let count = 0;
  let matched = 0;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < STRUCTURE_WIDTH; x++) {
      if (!edges[y * STRUCTURE_WIDTH + x]) continue;
      count++;
      if (checkHasEdgeNear(otherEdges, x, y, height)) matched++;
    }
  return count === 0 ? 0 : matched / count;
};
// How alike two images are where a pixel mean cannot say, as for a scene rebuilt from shapes rather than copied: the
// Shape is the edges they share, as an F-score of each one's edges found in the other, and the tone is the mean
// Difference of their colour blurred past any texture, as a percentage
export const scoreStructure = async (reference: Buffer, ours: Buffer): Promise<StructureScores> => {
  const { height: referenceHeight, width: referenceWidth } = await sharp(reference).metadata();
  const height = Math.round((STRUCTURE_WIDTH / referenceWidth) * referenceHeight);
  const [referenceGrey, ourGrey] = await Promise.all([readGrey(reference, height), readGrey(ours, height)]);
  const referenceEdges = readEdges(referenceGrey, height);
  const ourEdges = readEdges(ourGrey, height);
  const precision = readMatchedShare(ourEdges, referenceEdges, height);
  const recall = readMatchedShare(referenceEdges, ourEdges, height);
  const edgeScore = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  const readTone = (input: Buffer) =>
    sharp(input).resize(STRUCTURE_WIDTH, height, { fit: "fill" }).removeAlpha().blur(TONE_BLUR_SIGMA).raw().toBuffer();
  const [referenceTone, ourTone] = await Promise.all([readTone(reference), readTone(ours)]);
  let toneSum = 0;
  for (let index = 0; index < referenceTone.length; index++)
    toneSum += Math.abs((referenceTone[index] ?? 0) - (ourTone[index] ?? 0));
  return { edgeScore, toneDifference: (toneSum / referenceTone.length / 255) * 100 };
};
