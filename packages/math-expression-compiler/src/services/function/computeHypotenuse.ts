// The length of a vector, by mathjs's running sum of squares scaled by the largest magnitude so far, which no square can
// Overflow. A larger magnitude rescales the sum to itself, and an equal one adds one, so two infinities are infinite.
// The comparisons are exact, where mathjs's tolerance reads a magnitude near zero as zero
export const computeHypotenuse = (values: readonly number[]): number => {
  let largest = 0;
  let total = 0;
  for (const value of values) {
    const magnitude = Math.abs(value);
    if (largest < magnitude) {
      const ratio = largest / magnitude;
      total = total * (ratio * ratio) + 1;
      largest = magnitude;
    } else if (magnitude > 0) {
      const ratio = magnitude === largest ? 1 : magnitude / largest;
      total += ratio * ratio;
    }
    // A zero adds nothing, and a NaN makes the sum NaN
    else total += magnitude;
  }
  return largest * Math.sqrt(total);
};
