// One pass of the blur: each of `lineCount` lines of `length` samples, `lineStride` apart, is blurred along itself by the
// Weights, its taps clamped at its ends, with `sampleStride` the step from one of its samples to the next
export const blurLines = (
  values: Float32Array,
  lineCount: number,
  length: number,
  lineStride: number,
  sampleStride: number,
  weights: Float32Array,
): Float32Array => {
  const radius = (weights.length - 1) / 2;
  const blurred = new Float32Array(values.length);
  for (let line = 0; line < lineCount; line++)
    for (let position = 0; position < length; position++) {
      let sum = 0;
      for (const [index, weight] of weights.entries()) {
        const sample = Math.min(Math.max(position + index - radius, 0), length - 1);
        sum += weight * (values[line * lineStride + sample * sampleStride] ?? 0);
      }
      blurred[line * lineStride + position * sampleStride] = sum;
    }
  return blurred;
};
