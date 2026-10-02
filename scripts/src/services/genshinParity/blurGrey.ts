// A grey image blurred by a separable Gaussian of the sigma given, in pixels, out to three sigmas, its edges clamped
export const blurGrey = (values: Float32Array, width: number, height: number, sigma: number): Float32Array => {
  const radius = Math.ceil(3 * sigma);
  const window = Array.from({ length: radius * 2 + 1 }, (_, index) =>
    Math.exp(-((index - radius) ** 2) / (2 * sigma ** 2)),
  );
  const windowSum = window.reduce((sum, weight) => sum + weight, 0);
  const rows = new Float32Array(values.length);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (const [index, weight] of window.entries()) {
        const sampleX = Math.min(Math.max(x + index - radius, 0), width - 1);
        sum += weight * (values[y * width + sampleX] ?? 0);
      }
      rows[y * width + x] = sum / windowSum;
    }
  const columns = new Float32Array(values.length);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (const [index, weight] of window.entries()) {
        const sampleY = Math.min(Math.max(y + index - radius, 0), height - 1);
        sum += weight * (rows[sampleY * width + x] ?? 0);
      }
      columns[y * width + x] = sum / windowSum;
    }
  return columns;
};
