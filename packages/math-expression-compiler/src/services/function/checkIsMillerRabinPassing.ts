import { computeModularPower } from "#src/services/function/computeModularPower";

// Whether a window of Miller-Rabin rounds passes for one base: the power is one or minus one, or squaring it reaches minus one.
// The squaring runs only while the power of two below the number's own factor allows
export const checkIsMillerRabinPassing = (candidate: bigint, base: bigint, oddPart: bigint, twos: number): boolean => {
  const minusOne = candidate - 1n;
  let power = computeModularPower(base, oddPart, candidate);
  if (power === 1n || power === minusOne) return true;
  for (let round = 1; round < twos; round++) {
    power = (power * power) % candidate;
    if (power === minusOne) return true;
  }
  return false;
};
