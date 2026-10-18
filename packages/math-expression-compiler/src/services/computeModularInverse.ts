// The inverse of a value modulo `modulus`, read off the extended Euclidean algorithm the way mathjs runs it, so a negative
// Modulus gives mathjs's answer too. Not integers, or not invertible, is NaN
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

  const inverse = remainder < 0 ? -previousCoefficient : previousCoefficient;
  return inverse < 0 ? inverse + modulus : inverse;
};
