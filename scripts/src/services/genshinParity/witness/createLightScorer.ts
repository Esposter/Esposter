import { CHANNELS } from "#src/services/genshinParity/shared/constants";
import { createFlipScorer } from "#src/services/genshinParity/shared/readFlipErrorMap";
import { BYTE } from "#src/services/shared/constants";
import { toSrgb } from "#src/services/shared/toSrgb";
import sharp from "sharp";

// A frame's FLIP error over its scored pixels against the reference image: the frame, linear, is encoded as sRGB and
// Scored by one scorer built over the image, once
export const createLightScorer = async ({
  checkIsScored,
  height,
  image,
  width,
}: {
  checkIsScored: (pixel: number, width: number) => boolean;
  height: number;
  image: Buffer;
  width: number;
}): Promise<(linear: Float32Array) => Promise<number>> => {
  const scoreAgainstImage = await createFlipScorer(image, width, height);
  return async (linear) => {
    const encoded = await sharp(
      Buffer.from(Array.from(linear, (value) => Math.round(Math.min(Math.max(toSrgb(value), 0), 1) * BYTE))),
      { raw: { channels: CHANNELS.length, height, width } },
    )
      .png()
      .toBuffer();
    const { errorMap } = await scoreAgainstImage(encoded);
    let [error, scoredCount] = [0, 0];
    for (let pixel = 0; pixel < width * height; pixel++) {
      if (!checkIsScored(pixel, width)) continue;
      error += errorMap[pixel] ?? 0;
      scoredCount++;
    }
    return error / Math.max(scoredCount, 1);
  };
};
