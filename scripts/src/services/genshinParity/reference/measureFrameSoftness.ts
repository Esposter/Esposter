import { estimateEdgeSigma } from "#src/services/genshinParity/reference/estimateEdgeSigma";
import { InvalidOperationError, Operation } from "@esposter/shared";
import sharp from "sharp";

// The samples either side of an edge's peak, so its whole rise and fall lie inside the profile read across it
const PROFILE_RADIUS = 6;
// The least rise an interface edge has: text strokes and panel borders against their ground, not the scene's shading
const MIN_CONTRAST = 128;
// The share of the edges read that are sharpest, the lowest spreads, whose median is the capture's own blur
const SHARPEST_SHARE = 0.25;

// The sigma of each edge along one row or column: every peak of its gradient with a profile around it and a rise big
// Enough to read
const readLineSigmas = (line: Float64Array, sigmas: number[]): void => {
  for (let index = PROFILE_RADIUS; index < line.length - PROFILE_RADIUS; index++) {
    const gradient = Math.abs((line[index + 1] ?? 0) - (line[index - 1] ?? 0));
    const previousGradient = Math.abs((line[index] ?? 0) - (line[index - 2] ?? 0));
    const nextGradient = Math.abs((line[index + 2] ?? 0) - (line[index] ?? 0));
    if (gradient === 0 || gradient <= previousGradient || gradient < nextGradient) continue;
    const profile = [...line.subarray(index - PROFILE_RADIUS, index + PROFILE_RADIUS + 1)];
    if (Math.max(...profile) - Math.min(...profile) < MIN_CONTRAST) continue;
    const sigma = estimateEdgeSigma(profile);
    if (sigma !== undefined) sigmas.push(sigma);
  }
};

// A frame's capture blur as a Gaussian sigma in its pixels, read off its interface edges across every row and column.
// The game draws its text and borders crisp, so only the recording's compression and scaling soften them: the median of
// The sharpest share of the edges read is the blur the recording puts on them
export const measureFrameSoftness = async (framePath: string): Promise<number> => {
  const { data, info } = await sharp(framePath).greyscale().raw().toBuffer({ resolveWithObject: true });
  const { height, width } = info;
  const sigmas: number[] = [];
  const row = new Float64Array(width);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) row[x] = data[y * width + x] ?? 0;
    readLineSigmas(row, sigmas);
  }
  const column = new Float64Array(height);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) column[y] = data[y * width + x] ?? 0;
    readLineSigmas(column, sigmas);
  }
  if (sigmas.length === 0)
    throw new InvalidOperationError(Operation.Read, framePath, "no interface edge to measure the capture's blur from");
  const sharpest = sigmas
    .toSorted((first, second) => first - second)
    .slice(0, Math.ceil(sigmas.length * SHARPEST_SHARE));
  const middle = Math.floor(sharpest.length / 2);
  return sharpest.length % 2 === 0
    ? ((sharpest[middle - 1] ?? 0) + (sharpest[middle] ?? 0)) / 2
    : (sharpest[middle] ?? 0);
};
