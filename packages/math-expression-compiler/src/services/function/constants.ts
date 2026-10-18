// Mathjs's defaults for comparing two numbers: equal when they differ by less than this share of the larger.
// Two numbers that differ by less than the absolute tolerance are equal too
export const MATH_EXPRESSION_RELATIVE_TOLERANCE = 1e-12;
export const MATH_EXPRESSION_ABSOLUTE_TOLERANCE = 1e-15;
// The square root of pi, which the error function and its inverse both divide by
export const SQRT_PI: number = Math.sqrt(Math.PI);
// The most digits a rounding function takes
export const MAXIMUM_DIGITS = 15;
// The work of a Stirling number is its count times the narrower of its band, the parts or the count less the parts.
// A number past this work is an error rather than a long loop
export const MAXIMUM_STIRLING_WORK = 4_000_000;
// The bases under which Miller-Rabin is exact for every integer below 3.3e24, so for the safe integers it is deterministic
export const MILLER_RABIN_BASES: readonly bigint[] = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
// The inverse of the error function: Giles's approximation gives the first guess, and Newton steps on erf itself refine
// It, so that erf of the result returns the argument to machine precision
export const REFINEMENT_STEPS = 4;
export const LOW_TAIL_COEFFICIENTS: readonly number[] = [
  3.43273939e-7, -3.5233877e-6, -4.39150654e-6, 0.00021858087, -0.00125372503, -0.00417768164, 0.246640727, 1.50140941,
];
export const HIGH_TAIL_COEFFICIENTS: readonly number[] = [
  0.000100950558, 0.00134934322, -0.00367342844, 0.00573950773, -0.0076224613, 0.00943887047, 1.00167406, 2.83297682,
];
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
// The Riemann zeta function. Above zero it is the Euler-Maclaurin sum, whose Bernoulli terms make it exact to machine precision.
// Below zero the functional equation turns it into that sum at one minus the argument
export const EULER_MACLAURIN_COEFFICIENTS: readonly number[] = [
  1 / 12,
  -1 / 720,
  1 / 30240,
  -1 / 1209600,
  1 / 47900160,
  -691 / 1307674368000,
  1 / 74724249600,
  -3617 / 10670622842880000,
];
export const SUMMATION_LIMIT = 10;
