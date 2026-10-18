// The sum of a list from the left, the order mathjs adds in, so the rounding is the same
export const computeSum = (values: readonly number[]): number => values.reduce((total, value) => total + value, 0);
