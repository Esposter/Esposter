import { STRUCTURE_WIDTH } from "#src/services/genshinParity/constants";
import { computeDistanceTransform } from "#src/services/genshinParity/computeDistanceTransform";
import { readVerticalLines } from "#src/services/genshinParity/readVerticalLines";

// A line farther than this from the other image's, in pixels at the structure's width, counts as missing and no more,
// So one line the other image lacks cannot outweigh every line the two share
const LINE_DISTANCE_LIMIT = 16;
// How far one image's lines sit from another's on average, each distance held to the limit
const readMeanDistance = (lines: Uint8Array, otherDistances: Float32Array): number => {
  let sum = 0;
  let count = 0;
  for (const [index, isLine] of lines.entries()) {
    if (!isLine) continue;
    sum += Math.min(otherDistances[index] ?? LINE_DISTANCE_LIMIT, LINE_DISTANCE_LIMIT);
    count++;
  }
  return count === 0 ? LINE_DISTANCE_LIMIT : sum / count;
};
// How far a shot's long vertical lines sit from a reference's, as the mean over both directions of each line pixel's
// Distance to the other image's nearest, in pixels at the structure's width. Clouds draw no long vertical lines, so a
// Reference's sky does not score, and the distance falls smoothly as a scene's towers come into register. The
// Reference's lines are read once, and each shot scored against them
export const createLineDistanceScorer = async (
  reference: Buffer,
  height: number,
): Promise<(shot: Buffer) => Promise<number>> => {
  const referenceLines = await readVerticalLines(reference, height);
  const referenceDistances = computeDistanceTransform(referenceLines, STRUCTURE_WIDTH, height);
  return async (shot) => {
    const shotLines = await readVerticalLines(shot, height);
    const shotDistances = computeDistanceTransform(shotLines, STRUCTURE_WIDTH, height);
    return (readMeanDistance(referenceLines, shotDistances) + readMeanDistance(shotLines, referenceDistances)) / 2;
  };
};
