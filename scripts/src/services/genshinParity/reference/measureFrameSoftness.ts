import { readLineSigmas } from "#src/services/genshinParity/reference/readLineSigmas";
import { InvalidOperationError, Operation } from "@esposter/shared";
import sharp from "sharp";

// The share of the edges read that are sharpest, the lowest spreads, whose median is the capture's own blur
const SHARPEST_SHARE = 0.25;

// A frame's capture blur as a Gaussian sigma in its pixels, read off its interface edges across every row and column.
// The game draws its text and borders crisp, so only the recording's compression and scaling soften them: the median of
// The sharpest share of the edges read is the blur the recording puts on them
export const measureFrameSoftness = async (frame: Buffer): Promise<number> => {
  const { data, info } = await sharp(frame).greyscale().raw().toBuffer({ resolveWithObject: true });
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
    throw new InvalidOperationError(Operation.Read, "frame", "no interface edge to measure the capture's blur from");
  const sharpest = sigmas
    .toSorted((firstSigma, secondSigma) => firstSigma - secondSigma)
    .slice(0, Math.ceil(sigmas.length * SHARPEST_SHARE));
  const middle = Math.floor(sharpest.length / 2);
  return sharpest.length % 2 === 0
    ? ((sharpest[middle - 1] ?? 0) + (sharpest[middle] ?? 0)) / 2
    : (sharpest[middle] ?? 0);
};
