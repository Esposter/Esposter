import { FLIP_PIXELS_PER_DEGREE, FLIP_SCREEN_WIDTH } from "#src/services/genshinParity/shared/constants";
import { readRgb } from "#src/services/genshinParity/shared/readRgb";
import { scoreFlip } from "#src/services/genshinParity/shared/scoreFlip";

const scoreAgainst = (referenceRgb: Float32Array, shotRgb: Float32Array, width: number, height: number) =>
  scoreFlip(referenceRgb, shotRgb, width, height, (FLIP_PIXELS_PER_DEGREE * width) / FLIP_SCREEN_WIDTH);

// FLIP's error map of a shot against its reference, both read at the size given and seen as a full screen at FLIP's
// Default viewing distance, so a frame scored small is judged as it would be large
export const readFlipErrorMap = async (
  reference: Buffer,
  shot: Buffer,
  width: number,
  height: number,
): Promise<{ errorMap: Float32Array; mean: number }> => {
  const [referenceRgb, shotRgb] = await Promise.all([readRgb(reference, width, height), readRgb(shot, width, height)]);
  return scoreAgainst(referenceRgb, shotRgb, width, height);
};

// The same score for many shots of one reference, which is decoded once rather than with each shot
export const createFlipScorer = async (
  reference: Buffer,
  width: number,
  height: number,
): Promise<(shot: Buffer) => Promise<{ errorMap: Float32Array; mean: number }>> => {
  const referenceRgb = await readRgb(reference, width, height);
  return async (shot) => scoreAgainst(referenceRgb, await readRgb(shot, width, height), width, height);
};
