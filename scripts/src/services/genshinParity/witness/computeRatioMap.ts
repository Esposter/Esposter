import { CHANNELS } from "#src/services/genshinParity/shared/constants";
import { MIN_DENOMINATOR } from "#src/services/genshinParity/witness/constants";
import { readLuminance } from "#src/services/genshinParity/witness/readLuminance";
import { BYTE } from "#src/services/shared/constants";
import { toSrgb } from "#src/services/shared/toSrgb";
import sharp from "sharp";

// The ratio the map draws at full strength, ours twice or half the reference's, by its base-two logarithm
const RATIO_MAP_STOPS = 1;
// How bright the reference shows round the parts on the map, a share of its own brightness
const RATIO_MAP_BACKDROP = 0.4;

// A map of the smooth field's ratio over the frame, red where the exports stand brighter than the reference and blue
// Where darker, the rest of the reference grey and dimmed so the parts stand out against where they stand
export const computeRatioMap = async ({
  blurredExports,
  blurredReference,
  checkIsPart,
  height,
  reference,
  width,
}: {
  blurredExports: Float32Array;
  blurredReference: Float32Array;
  checkIsPart: (pixel: number) => boolean;
  height: number;
  reference: Float32Array;
  width: number;
}): Promise<Buffer> => {
  const count = width * height;
  const ratioPixels = Buffer.alloc(count * CHANNELS.length);
  for (let pixel = 0; pixel < count; pixel++) {
    if (!checkIsPart(pixel)) {
      const shade = Math.round(toSrgb(readLuminance(reference, pixel)) * BYTE * RATIO_MAP_BACKDROP);
      ratioPixels.set([shade, shade, shade], pixel * CHANNELS.length);
      continue;
    }
    const stops = Math.log2(
      Math.max(readLuminance(blurredExports, pixel), MIN_DENOMINATOR) /
        Math.max(readLuminance(blurredReference, pixel), MIN_DENOMINATOR),
    );
    const strength = Math.round(Math.min(Math.abs(stops) / RATIO_MAP_STOPS, 1) * BYTE);
    ratioPixels.set(
      stops > 0 ? [BYTE, BYTE - strength, BYTE - strength] : [BYTE - strength, BYTE - strength, BYTE],
      pixel * CHANNELS.length,
    );
  }
  return sharp(ratioPixels, { raw: { channels: CHANNELS.length, height, width } })
    .png()
    .toBuffer();
};
