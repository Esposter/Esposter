import { computeModularPower } from "#src/services/function/computeModularPower";
import { MILLER_RABIN_BASES } from "#src/services/function/constants";

// Whether a window of Miller-Rabin rounds passes for one base: the power is one or minus one, or squaring it reaches minus one.
// The squaring runs only while the power of two below the number's own factor allows
const checkIsMillerRabinPassing = (candidate: bigint, base: bigint, oddPart: bigint, twos: number): boolean => {
  const minusOne = candidate - 1n;
  let power = computeModularPower(base, oddPart, candidate);
  if (power === 1n || power === minusOne) return true;
  for (let round = 1; round < twos; round++) {
    power = (power * power) % candidate;
    if (power === minusOne) return true;
  }
  return false;
};

// Whether an integer is prime, by Miller-Rabin over fixed bases, which never trial-divides.
// Past the safe integers every number is even, so composite, and the test runs only on the safe ones
export const computeIsPrime = (value: number): boolean => {
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
