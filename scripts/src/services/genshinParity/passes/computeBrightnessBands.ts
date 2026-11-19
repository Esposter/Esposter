import type { BrightnessBandReading } from "#src/models/genshinParity/passes/BrightnessBandReading";

import { BrightnessBand } from "#src/models/genshinParity/passes/BrightnessBand";
import { getPixelDisplayColor } from "#src/services/genshinParity/sky/getPixelDisplayColor";
import { BYTE } from "#src/services/shared/constants";
import { toLab } from "#src/services/shared/toLab";
import { toSrgb } from "#src/services/shared/toSrgb";
import { toXyz } from "#src/services/shared/toXyz";
import { GENSHIN_BLOOM_THRESHOLD, toneMapGenshin } from "genshin-engine";

// The bloom's threshold as the display shows it: the tone curve takes a scene channel at the threshold to a linear one,
// Which the display encodes to sRGB. A reference channel over that shade is one the bloom's prefilter takes
const [thresholdLinear] = toneMapGenshin([GENSHIN_BLOOM_THRESHOLD, GENSHIN_BLOOM_THRESHOLD, GENSHIN_BLOOM_THRESHOLD]);
const BLOOM_THRESHOLD_SHADE = toSrgb(thresholdLinear) * BYTE;
// CIELab lightness runs from 0 to 100, and the shadows, mids and highlights are its thirds
const LIGHTNESS_THIRD = 100 / 3;

interface BandTotal {
  absolute: number;
  count: number;
  signed: number;
}

const createTotal = (): BandTotal => ({ absolute: 0, count: 0, signed: 0 });

// The lightness band a reference pixel's lightness falls in, the one of the three that partitions the pixels
const getLightnessBand = (lightness: number): BrightnessBand => {
  if (lightness < LIGHTNESS_THIRD) return BrightnessBand.Shadows;
  if (lightness < 2 * LIGHTNESS_THIRD) return BrightnessBand.Mids;
  return BrightnessBand.Highlights;
};

// Whether any channel of a reference pixel is over the bloom's threshold, as the prefilter takes each channel alone
const checkIsAboveThreshold = (reference: Buffer, pixel: number): boolean =>
  [0, 1, 2].some((channel) => (reference[pixel * 3 + channel] ?? 0) > BLOOM_THRESHOLD_SHADE);

// Each scored pixel's lightness error, ours less the reference, sorted into the lightness band the reference's lightness
// Falls in, and into the above-threshold band too where a reference channel is over the bloom's threshold. The bands
// Are read over the same pixels for both frames, so a pixel moves between them by the reference alone
export const computeBrightnessBands = (
  reference: Buffer,
  ours: Buffer,
  width: number,
  height: number,
  scored: Uint8Array,
): BrightnessBandReading[] => {
  const totals: Record<BrightnessBand, BandTotal> = {
    [BrightnessBand.AboveThreshold]: createTotal(),
    [BrightnessBand.Highlights]: createTotal(),
    [BrightnessBand.Mids]: createTotal(),
    [BrightnessBand.Shadows]: createTotal(),
  };
  for (let pixel = 0; pixel < width * height; pixel++) {
    if (!scored[pixel]) continue;
    const referenceLightness = toLab(toXyz(getPixelDisplayColor(reference, pixel)))[0];
    const error = toLab(toXyz(getPixelDisplayColor(ours, pixel)))[0] - referenceLightness;
    const bands = [getLightnessBand(referenceLightness)];
    if (checkIsAboveThreshold(reference, pixel)) bands.push(BrightnessBand.AboveThreshold);
    for (const band of bands) {
      const total = totals[band];
      total.count++;
      total.signed += error;
      total.absolute += Math.abs(error);
    }
  }
  return Object.values(BrightnessBand).map((band) => {
    const { absolute, count, signed } = totals[band];
    return {
      band,
      meanAbsoluteError: count === 0 ? undefined : absolute / count,
      meanSignedError: count === 0 ? undefined : signed / count,
      pixels: count,
    };
  });
};
