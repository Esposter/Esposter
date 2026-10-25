import { blurLines } from "#src/services/genshinParity/shared/blurLines";
import { getBlurWeights } from "genshin-world";

// A grey image blurred by a separable Gaussian of the sigma given, in pixels, out to three sigmas, its edges clamped
export const blurGrey = (values: Float32Array, width: number, height: number, sigma: number): Float32Array => {
  const weights = getBlurWeights(sigma);
  const rows = blurLines(values, height, width, width, 1, weights);
  return blurLines(rows, width, height, 1, width, weights);
};
