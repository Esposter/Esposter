import { roundFitted } from "#src/services/genshinAssets/roundFitted";
import sharp from "sharp";

const BYTE = 255;
// The candidate band ends tried, as hundredths of the ray's height
const BAND_STEPS = 100;
const smoothstep = (edge: number, value: number): number => {
  const t = Math.min(Math.max(value / edge, 0), 1);
  return t * t * (3 - 2 * t);
};
// How far up the sky the horizon's colour holds before the zenith's has taken over, from a sky gradient whose red
// Runs from the horizon's full weight at its left to none: the end of the smoothstep that falls the same way, found by
// Least squares over every texel of its first row
export const fitHorizonBand = async (gradient: Buffer | string): Promise<number> => {
  const { data, info } = await sharp(gradient).raw().toBuffer({ resolveWithObject: true });
  const weights = Array.from({ length: info.width }, (_, x) => (data[x * info.channels] ?? 0) / BYTE);
  let bestBand = 1;
  let bestError = Infinity;
  for (let step = 1; step <= BAND_STEPS; step++) {
    const band = step / BAND_STEPS;
    const error = weights.reduce(
      (sum, weight, x) => sum + (weight - (1 - smoothstep(band, x / (info.width - 1)))) ** 2,
      0,
    );
    if (error < bestError) {
      bestError = error;
      bestBand = band;
    }
  }
  return roundFitted(bestBand);
};
