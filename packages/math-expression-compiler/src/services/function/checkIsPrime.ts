import { checkIsMillerRabinPassing } from "#src/services/function/checkIsMillerRabinPassing";
import { MILLER_RABIN_BASES } from "#src/services/function/constants";

// Whether an integer is prime, by Miller-Rabin over fixed bases, which never trial-divides.
// Past the safe integers every number is even, so composite, and the test runs only on the safe ones
export const checkIsPrime = (value: number): boolean => {
  if (!Number.isInteger(value) || value < 2 || value > Number.MAX_SAFE_INTEGER) return false;

  const candidate = BigInt(value);
  for (const base of MILLER_RABIN_BASES) {
    if (candidate === base) return true;
    if (candidate % base === 0n) return false;
  }
  let oddPart = candidate - 1n;
  let twos = 0;
  while (oddPart % 2n === 0n) {
    oddPart /= 2n;
    twos++;
  }
  return MILLER_RABIN_BASES.every((base) => checkIsMillerRabinPassing(candidate, base, oddPart, twos));
};
