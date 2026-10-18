import { BERNOULLI_CLOSED_FORM_INDEX } from "#src/services/function/constants";

// The Bernoulli number of an index, by the recurrence that starts from one below the closed form's index. Above one the odd
// Ones are zero, which is exact rather than the rounding residue the recurrence leaves behind
export const computeBernoulliNumber = (index: number): number => {
  if (index === 1) return -0.5;
  if (index > 1 && index % 2 === 1) return 0;
  if (index >= BERNOULLI_CLOSED_FORM_INDEX) {
    // The even index 2n is (-1)^(n+1) 2 (2n)! zeta(2n) / (2 pi)^(2n), where zeta is one to double precision. The product stops
    // Once it overflows, which is infinite in the sign the index gives
    let product = 1;
    for (let factor = 1; factor <= index && Number.isFinite(product); factor++) product *= factor / (2 * Math.PI);
    return (index / 2) % 2 === 1 ? 2 * product : -2 * product;
  }

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
