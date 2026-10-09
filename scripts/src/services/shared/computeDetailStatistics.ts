import { blurGrey } from "#src/services/genshinParity/shared/blurGrey";
import { SURFACE_DETAIL_BAND_SIGMAS } from "genshin-engine";

// The mean of a grey image over the pixels a mask holds, blurred by a Gaussian of the sigma given: each pixel is the
// Blurred image over the blurred mask beneath it, so a pixel off the mask takes only its neighbours' values
const blurMasked = (
  values: Float32Array,
  mask: Uint8Array,
  width: number,
  height: number,
  sigma: number,
): Float32Array => {
  const weighted = Float32Array.from(values, (value, index) => value * (mask[index] ?? 0));
  const blurredValues = blurGrey(weighted, width, height, sigma);
  const blurredMask = blurGrey(Float32Array.from(mask), width, height, sigma);
  return Float32Array.from(blurredValues, (value, index) =>
    (blurredMask[index] ?? 0) > 0 ? value / (blurredMask[index] ?? 1) : 0,
  );
};
// A grey image's statistics over the pixels a mask holds: the variance of its luminance, then the mean square of each
// Octave band's detail, finest first. Empty when the mask holds no pixel
export const computeDetailStatistics = (
  values: Float32Array,
  mask: Uint8Array,
  width: number,
  height: number,
): number[] => {
  let count = 0;
  let sum = 0;
  for (const [index, value] of values.entries())
    if (mask[index]) {
      count++;
      sum += value;
    }
  if (count === 0) return [];
  const mean = sum / count;
  let variance = 0;
  for (const [index, value] of values.entries()) if (mask[index]) variance += (value - mean) ** 2;
  // The blur each octave band is read between, a pixel's detail at each: the band between two neighbouring sigmas is
  // The energy of their difference, so the bands run from a pixel's own detail up to the coarsest sigma's
  const smoothed = [
    values,
    ...SURFACE_DETAIL_BAND_SIGMAS.map((sigma) => blurMasked(values, mask, width, height, sigma)),
  ];
  const bands = smoothed.slice(0, -1).map((finer, band) => {
    const coarser = smoothed[band + 1] ?? finer;
    let energy = 0;
    for (const [index, finerValue] of finer.entries())
      if (mask[index]) energy += ((finerValue ?? 0) - (coarser[index] ?? 0)) ** 2;
    return energy / count;
  });
  return [variance / count, ...bands];
};
