// A Gaussian's window of the sigma given, out to three sigmas and normalised to sum to one, as the CPU blur reads it
export const getBlurWeights = (sigma: number): Float32Array => {
  const radius = Math.ceil(3 * sigma);
  const window = Array.from({ length: radius * 2 + 1 }, (_value, index) =>
    Math.exp(-((index - radius) ** 2) / (2 * sigma ** 2)),
  );
  const windowSum = window.reduce((sum, weight) => sum + weight, 0);
  return Float32Array.from(window, (weight) => weight / windowSum);
};
