import { blurGrey } from "#src/services/genshinParity/shared/blurGrey";

// The mean of a grey image over the pixels a mask holds, blurred by a Gaussian of the sigma given: each pixel is the
// Blurred image over the blurred mask beneath it, so a pixel off the mask takes only its neighbours' values
export const blurMasked = (
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
