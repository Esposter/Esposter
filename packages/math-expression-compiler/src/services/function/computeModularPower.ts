export const computeModularPower = (base: bigint, exponent: bigint, modulus: bigint): bigint => {
  let result = 1n;
  let square = base % modulus;
  let remaining = exponent;
  while (remaining > 0n) {
    if (remaining % 2n === 1n) result = (result * square) % modulus;
    square = (square * square) % modulus;
    remaining /= 2n;
  }
  return result;
};
