// Mathjs's named constants: the upper-case aliases of pi and e, and true and false as the numbers they read as
export const MathExpressionConstantMap: Record<string, number> = {
  E: Math.E,
  e: Math.E,
  false: 0,
  Infinity: Number.POSITIVE_INFINITY,
  LN2: Math.LN2,
  LN10: Math.LN10,
  LOG2E: Math.LOG2E,
  LOG10E: Math.LOG10E,
  NaN: Number.NaN,
  phi: (1 + Math.sqrt(5)) / 2,
  PI: Math.PI,
  pi: Math.PI,
  SQRT1_2: Math.SQRT1_2,
  SQRT2: Math.SQRT2,
  tau: 2 * Math.PI,
  true: 1,
};
