import { computeDistanceTransform } from "#src/services/genshinParity/computeDistanceTransform";
import { STRUCTURE_WIDTH } from "#src/services/genshinParity/constants";
import { readVerticalLines } from "#src/services/genshinParity/readVerticalLines";
import sharp from "sharp";

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
// A scorer of one orientation's lines: a horizontal line is a vertical one of the image turned a quarter turn, read at
// The structure's width across what was its height
const createOrientedScorer = async (
  reference: Buffer,
  height: number,
  isHorizontal: boolean,
): Promise<(shot: Buffer) => Promise<number>> => {
  const turn = (image: Buffer): Promise<Buffer> =>
    isHorizontal ? sharp(image).rotate(90).png().toBuffer() : Promise.resolve(image);
  const lineHeight = isHorizontal ? Math.round((STRUCTURE_WIDTH * STRUCTURE_WIDTH) / height) : height;
  const referenceLines = await readVerticalLines(await turn(reference), lineHeight);
  const referenceDistances = computeDistanceTransform(referenceLines, STRUCTURE_WIDTH, lineHeight);
  return async (shot) => {
    const shotLines = await readVerticalLines(await turn(shot), lineHeight);
    const shotDistances = computeDistanceTransform(shotLines, STRUCTURE_WIDTH, lineHeight);
    return (readMeanDistance(referenceLines, shotDistances) + readMeanDistance(shotLines, referenceDistances)) / 2;
  };
};
// How far a shot's long straight lines sit from a reference's, vertical and horizontal alike, as the mean over both
// Directions of each line pixel's distance to the other image's nearest, in pixels at the structure's width. Clouds
// Draw no long straight lines, so a reference's sky does not score. The vertical lines, the towers' sides, pin the
// Heading and the place across; the horizontal ones, a door's top and foot or a bridge's deck, pin the height, which
// No vertical line changes with. The reference's lines are read once, and each shot scored against them
export const createLineDistanceScorer = async (
  reference: Buffer,
  height: number,
): Promise<(shot: Buffer) => Promise<number>> => {
  const [scoreVertical, scoreHorizontal] = await Promise.all([
    createOrientedScorer(reference, height, false),
    createOrientedScorer(reference, height, true),
  ]);
  return async (shot) => {
    const [vertical, horizontal] = await Promise.all([scoreVertical(shot), scoreHorizontal(shot)]);
    return (vertical + horizontal) / 2;
  };
};
