// The deepest parentheses, unary operators or assignments a formula may nest, so a typed formula cannot exhaust the stack
export const MAX_MATH_EXPRESSION_DEPTH = 64;
// Mathjs's defaults for comparing two numbers: equal when they differ by less than this share of the larger, or by
// Less than the absolute tolerance
export const MATH_EXPRESSION_RELATIVE_TOLERANCE = 1e-12;
export const MATH_EXPRESSION_ABSOLUTE_TOLERANCE = 1e-15;
