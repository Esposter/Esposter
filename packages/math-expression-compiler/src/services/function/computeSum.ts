// The sum of a list from the left, the order mathjs adds in, so the rounding is the same. It starts from the first value, so
// A sum of negative zeros is negative zero, as mathjs sums, and an empty sum is zero
export const computeSum = (values: readonly number[]): number =>
  values.length === 0 ? 0 : values.reduce((total, value) => total + value);
