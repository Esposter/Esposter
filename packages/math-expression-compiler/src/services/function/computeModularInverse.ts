import { computeModulo } from "#src/services/function/computeModulo";

// The inverse of a value modulo `modulus`, read off the extended Euclidean algorithm the way mathjs runs it.
// The inverse is then reduced by the modulo, and a negative residue has the modulus added, as mathjs does, so a negative
// Modulus gives a value below it. A value or modulus that is not an integer, or a zero modulus, is null. A pair with no inverse is NaN
export const computeModularInverse = (value: number, modulus: number): null | number => {
  if (!Number.isInteger(value) || !Number.isInteger(modulus) || modulus === 0) return null;

  let remainder = value;
  let nextRemainder = modulus;
  let coefficient = 0;
  let previousCoefficient = 1;
  while (nextRemainder !== 0) {
    const quotient = Math.floor(remainder / nextRemainder);
    [coefficient, previousCoefficient] = [previousCoefficient - quotient * coefficient, coefficient];
    [remainder, nextRemainder] = [nextRemainder, remainder - quotient * nextRemainder];
  }
  const gcd = remainder < 0 ? -remainder : remainder;
  if (gcd !== 1) return Number.NaN;

  const inverse = computeModulo(remainder < 0 ? -previousCoefficient : previousCoefficient, modulus);
  return inverse < 0 ? inverse + modulus : inverse;
};
