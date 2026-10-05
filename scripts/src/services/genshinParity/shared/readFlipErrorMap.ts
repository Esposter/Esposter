import { FLIP_PIXELS_PER_DEGREE, FLIP_SCREEN_WIDTH } from "#src/services/genshinParity/shared/constants";
import { scoreFlip } from "#src/services/genshinParity/shared/scoreFlip";
import { BYTE } from "#src/services/shared/constants";
import sharp from "sharp";

const readRgb = async (input: Buffer, width: number, height: number): Promise<Float32Array> => {
  const { data } = await sharp(input)
    .resize(width, height, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return Float32Array.from(data, (value) => value / BYTE);
};
// FLIP's error map of a shot against its reference, both read at the size given and seen as a full screen at FLIP's
// Default viewing distance, so a frame scored small is judged as it would be large
export const readFlipErrorMap = async (
  reference: Buffer,
  shot: Buffer,
  width: number,
  height: number,
): Promise<{ errorMap: Float32Array; mean: number }> => {
  const [referenceRgb, shotRgb] = await Promise.all([readRgb(reference, width, height), readRgb(shot, width, height)]);
  return scoreFlip(referenceRgb, shotRgb, width, height, (FLIP_PIXELS_PER_DEGREE * width) / FLIP_SCREEN_WIDTH);
};
