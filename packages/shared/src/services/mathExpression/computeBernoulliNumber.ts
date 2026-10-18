// The first even index whose Bernoulli number is past the float range: the magnitude grows factorially, and this one is about
// 1.8e308 in magnitude, so every even index from here on is infinite in the sign its index gives
const OVERFLOW_INDEX = 260;

// The Bernoulli number of an index, by the recurrence that starts from one. Above one the odd ones are zero, which is
// Exact rather than the rounding residue the recurrence leaves behind
export const computeBernoulliNumber = (index: number): number => {
  if (index === 1) return -0.5;
  if (index > 1 && index % 2 === 1) return 0;
  if (index >= OVERFLOW_INDEX) return (index / 2) % 2 === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;

  const numbers: number[] = [1];
  for (let current = 1; current <= index; current++) {
    let sum = 0;
    let binomial = 1;
    for (let previous = 0; previous < current; previous++) {
      sum += binomial * (numbers[previous] ?? 0);
      binomial = (binomial * (current + 1 - previous)) / (previous + 1);
    }
    numbers.push(-sum / (current + 1));
  }
  return numbers[index] ?? Number.NaN;
};
