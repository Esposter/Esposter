// Mathjs's defaults for comparing two numbers: equal when they differ by less than this share of the larger.
// Two numbers that differ by less than the absolute tolerance are equal too
export const MATH_EXPRESSION_RELATIVE_TOLERANCE = 1e-12;
export const MATH_EXPRESSION_ABSOLUTE_TOLERANCE = 1e-15;
// The square root of pi, which the error function divides by
export const SQRT_PI: number = Math.sqrt(Math.PI);
// The most digits a rounding function takes
export const MAXIMUM_DIGITS = 15;
// The bases under which Miller-Rabin is exact for every integer below 3.3e24, so for the safe integers it is deterministic
export const MILLER_RABIN_BASES: readonly bigint[] = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
// The gamma function overflows above this argument, and an integer above the last factorial is infinite
export const OVERFLOW_ARGUMENT = 171.35;
export const LAST_FACTORIAL_ARGUMENT = 171;
// Stirling's series for the log of the gamma function, accurate to machine precision once its argument is this large
export const STIRLING_THRESHOLD = 15;
export const STIRLING_TERMS: readonly number[] = [
  1 / 12,
  -1 / 360,
  1 / 1260,
  -1 / 1680,
  1 / 1188,
  -691 / 360360,
  1 / 156,
];
