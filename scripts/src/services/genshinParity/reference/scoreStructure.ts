import type { StructureScores } from "#src/models/genshinParity/reference/StructureScores";

import { computeMatchedShare } from "#src/services/genshinParity/reference/computeMatchedShare";
import { STRUCTURE_WIDTH } from "#src/services/genshinParity/shared/constants";
import { readStructureEdges } from "#src/services/genshinParity/shared/readStructureEdges";
import { BYTE } from "#src/services/shared/constants";
import sharp from "sharp";

// The blur the tone is read through: the size of a pillar at the structure's width, so only light and colour are left
const TONE_BLUR_SIGMA = 8;

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
  const precision = computeMatchedShare(ourEdges, referenceEdges, height, layer);
  const recall = computeMatchedShare(referenceEdges, ourEdges, height, layer);
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
  return { edgeScore, toneDifference: (toneSum / Math.max(toneCount, 1) / BYTE) * 100 };
};
