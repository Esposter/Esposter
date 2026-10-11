// One pass of the blur: each of `lineCount` lines of `length` samples, `lineStride` apart, is blurred along itself by the
// Window, its taps clamped at its ends, with `sampleStride` the step from one of its samples to the next
const blurLines = (
  values: Float32Array,
  lineCount: number,
  length: number,
  lineStride: number,
  sampleStride: number,
  window: number[],
  windowSum: number,
): Float32Array => {
  const radius = (window.length - 1) / 2;
  const blurred = new Float32Array(values.length);
  for (let line = 0; line < lineCount; line++)
    for (let position = 0; position < length; position++) {
      let sum = 0;
      for (const [index, weight] of window.entries()) {
        const sample = Math.min(Math.max(position + index - radius, 0), length - 1);
        sum += weight * (values[line * lineStride + sample * sampleStride] ?? 0);
      }
      blurred[line * lineStride + position * sampleStride] = sum / windowSum;
    }
  return blurred;
};
// A grey image blurred by a separable Gaussian of the sigma given, in pixels, out to three sigmas, its edges clamped
export const blurGrey = (values: Float32Array, width: number, height: number, sigma: number): Float32Array => {
  const radius = Math.ceil(3 * sigma);
  const window = Array.from({ length: radius * 2 + 1 }, (_value, index) =>
    Math.exp(-((index - radius) ** 2) / (2 * sigma ** 2)),
  );
  const windowSum = window.reduce((sum, weight) => sum + weight, 0);
  const rows = blurLines(values, height, width, width, 1, window, windowSum);
  return blurLines(rows, width, height, 1, width, window, windowSum);
};
