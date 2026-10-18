import type { MathExpressionResult } from "#src/models/MathExpressionResult";

// The deepest parentheses, unary operators or assignments a formula may nest, so a typed formula cannot exhaust the stack
export const MAX_MATH_EXPRESSION_DEPTH = 64;
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
// The empty values and locals a constant subtree is computed with, which read no variable and no assignment
export const NO_VALUES: readonly number[] = [];
export const NO_LOCALS: MathExpressionResult[] = [];
