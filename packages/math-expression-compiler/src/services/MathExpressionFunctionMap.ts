import type { MathExpressionFunction } from "#src/models/MathExpressionFunction";

import { MathExpressionListForm } from "#src/models/MathExpressionListForm";
import { checkIsNearlyEqual } from "#src/services/checkIsNearlyEqual";
import { checkIsTruthy } from "#src/services/checkIsTruthy";
import { computeBernoulliNumber } from "#src/services/computeBernoulliNumber";
import { computeCombinations } from "#src/services/computeCombinations";
import { computeErf } from "#src/services/computeErf";
import { computeErfInverse } from "#src/services/computeErfInverse";
import { computeGamma } from "#src/services/computeGamma";
import { computeLogGamma } from "#src/services/computeLogGamma";
import { computeModularInverse } from "#src/services/computeModularInverse";
import { computeModulo } from "#src/services/computeModulo";
import { computeNthRoot } from "#src/services/computeNthRoot";
import { computeZeta } from "#src/services/computeZeta";
import { shiftDecimalPlaces } from "#src/services/shiftDecimalPlaces";
import { toNumber } from "#src/services/toNumber";

// A function of the table is keyed by its mathjs name. Its arguments are the ones its arity says, and its list form says
// How a square-bracketed list stands in for them. Its computation yields null where mathjs would throw, which the
// Evaluation turns into an error rather than a value
const MAXIMUM_DIGITS = 15;
const { Argument, None, Only, Spread } = MathExpressionListForm;

const countTruthy = (values: number[]): number => values.filter((value) => checkIsTruthy(value)).length;

const fixed = (
  arity: number,
  compute: (...values: number[]) => null | number,
  listForm = None,
): MathExpressionFunction => ({ compute, listForm, maxArity: arity, minArity: arity });
const ranged = (
  minArity: number,
  maxArity: number,
  compute: (...values: number[]) => null | number,
  listForm = None,
): MathExpressionFunction => ({ compute, listForm, maxArity, minArity });
const variadic = (
  minArity: number,
  compute: (...values: number[]) => null | number,
  listForm = None,
): MathExpressionFunction => ({ compute, listForm, maxArity: Number.POSITIVE_INFINITY, minArity });
const unary = (compute: (value: number) => null | number, listForm = None): MathExpressionFunction =>
  fixed(1, (...values) => compute(values[0] ?? Number.NaN), listForm);
const binary = (compute: (left: number, right: number) => null | number): MathExpressionFunction =>
  fixed(2, (...values) => compute(values[0] ?? Number.NaN, values[1] ?? Number.NaN));
const integerBinary = (compute: (left: number, right: number) => null | number): MathExpressionFunction =>
  binary((left, right) => (Number.isInteger(left) && Number.isInteger(right) ? compute(left, right) : null));
const integerUnary = (compute: (value: number) => null | number): MathExpressionFunction =>
  unary((value) => (Number.isInteger(value) ? compute(value) : null));
const digitally = (rounder: (value: number) => number): MathExpressionFunction =>
  ranged(1, 2, (...values) => {
    const [value = Number.NaN, digits = 0] = values;
    if (!Number.isInteger(digits) || digits < 0 || digits > MAXIMUM_DIGITS) return null;
    if (!Number.isFinite(value)) return value;
    return shiftDecimalPlaces(rounder(shiftDecimalPlaces(value, digits)), -digits);
  });
// A statistic of a list is undefined for an empty one, where mathjs throws
const ofNonEmpty =
  (compute: (values: number[]) => number) =>
  (...values: number[]): null | number =>
    values.length === 0 ? null : compute(values);

const sum = (values: number[]): number => values.reduce((total, value) => total + value, 0);
const mean = (values: number[]): number => sum(values) / values.length;
const variance = (values: number[]): number => {
  if (values.length === 1) return 0;
  const average = mean(values);
  return sum(values.map((value) => (value - average) ** 2)) / (values.length - 1);
};
const median = (values: number[]): number => {
  const sorted = values.toSorted((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle] ?? Number.NaN;
  return ((sorted[middle - 1] ?? Number.NaN) + (sorted[middle] ?? Number.NaN)) / 2;
};
const medianAbsoluteDeviation = (values: number[]): number => {
  const center = median(values);
  return median(values.map((value) => Math.abs(value - center)));
};
// Three-way comparison: zero when nearly equal, one when larger, minus one when smaller, and NaN when unordered
const computeComparison = (left: number, right: number): number => {
  if (checkIsNearlyEqual(left, right)) return 0;
  if (left > right) return 1;
  return left < right ? -1 : Number.NaN;
};
const computeGreatestCommonDivisor = (left: number, right: number): number =>
  right === 0 ? Math.abs(left) : computeGreatestCommonDivisor(right, left % right);
const computeFactorial = (value: number): null | number => {
  if (value < 0) return null;
  return computeGamma(value + 1);
};
// The Bell numbers grow with their index, so the first row whose start overflows makes every later one infinite too
const computeBellNumber = (index: number): null | number => {
  if (!Number.isInteger(index) || index < 0) return null;
  let row = [1];
  for (let step = 1; step <= index; step++) {
    const next = [row.at(-1) ?? 0];
    for (const above of row) next.push((next.at(-1) ?? 0) + above);
    if (next[0] === Number.POSITIVE_INFINITY) return Number.POSITIVE_INFINITY;
    row = next;
  }
  return row[0] ?? Number.NaN;
};
// Beyond this count the triangle of Stirling numbers is not built, so the cell is an error rather than a long loop
const MAXIMUM_STIRLING_COUNT = 2000;
const computeStirlingSecondKind = (count: number, parts: number): null | number => {
  if (!Number.isInteger(count) || !Number.isInteger(parts) || count < 0 || parts < 0 || parts > count) return null;
  if (count > MAXIMUM_STIRLING_COUNT) return null;
  let row = [1];
  for (let step = 1; step <= count; step++) {
    const next = [0];
    for (let part = 1; part <= step; part++) next.push(part * (row[part] ?? 0) + (row[part - 1] ?? 0));
    row = next;
  }
  return row[parts] ?? 0;
};
const computeCatalan = (index: number): null | number => {
  if (!Number.isInteger(index) || index < 0) return null;
  return Math.round(computeCombinations(2 * index, index) / (index + 1));
};
const computePermutations = (available: number, chosen: number): null | number => {
  if (!Number.isInteger(available) || !Number.isInteger(chosen) || chosen < 0 || chosen > available) return null;
  let result = 1;
  for (let factor = available - chosen + 1; factor <= available; factor++) {
    result *= factor;
    if (result > Number.MAX_VALUE) return Number.POSITIVE_INFINITY;
  }
  return result;
};
const computeMultinomial = (...parts: number[]): null | number => {
  if (!parts.every((part) => Number.isInteger(part) && part > 0)) return null;
  let result = 1;
  let running = 0;
  for (const part of parts) {
    running += part;
    result *= computeCombinations(running, part);
  }
  return result;
};
const computeCompositions = (total: number, parts: number): null | number => {
  if (!Number.isInteger(total) || !Number.isInteger(parts) || parts < 1 || parts > total) return null;
  return computeCombinations(total - 1, parts - 1);
};
const computeIntegerGreatestCommonDivisor = (values: number[]): null | number => {
  if (!values.every((value) => Number.isInteger(value))) return null;
  return values.reduce((total, value) => computeGreatestCommonDivisor(total, value), 0);
};
// The bases under which Miller-Rabin is exact for every integer below 3.3e24, so for the safe integers it is deterministic
const MILLER_RABIN_BASES: readonly bigint[] = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];

const computeModularPower = (base: bigint, exponent: bigint, modulus: bigint): bigint => {
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

// Whether a window of Miller-Rabin rounds passes for one base: the power is one or minus one, or it reaches minus one by
// Squaring while the power of two below the number's own factor allows
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
const computeIsPrime = (value: number): boolean => {
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
// The inverse of the hyperbolic cotangent, by its logarithm of one plus a small term, which keeps the precision that
// Atanh of the reciprocal loses when the argument is close to one
const computeInverseCoth = (value: number): number => {
  const magnitude = Math.abs(value);
  if (magnitude < 1) return Number.NaN;
  if (magnitude === 1) return value * Number.POSITIVE_INFINITY;
  return Math.sign(value) * 0.5 * Math.log1p(2 / (magnitude - 1));
};
const computeLogarithm = (value: number, base: number | undefined): number =>
  base === undefined ? Math.log(value) : Math.log(value) / Math.log(base);
const computeLeastCommonMultiple = (left: number, right: number): null | number => {
  if (!Number.isInteger(left) || !Number.isInteger(right)) return null;
  const divisor = computeGreatestCommonDivisor(left, right);
  return divisor === 0 ? 0 : Math.abs((left * right) / divisor);
};
const computeNorm = (...values: number[]): null | number => {
  if (values.length === 0) return 0;
  if (values.length === 1) return Math.abs(values[0] ?? Number.NaN);
  return Math.sqrt(sum(values.map((value) => value * value)));
};

export const MathExpressionFunctionMap: Record<string, MathExpressionFunction> = {
  abs: unary(Math.abs),
  acos: unary(Math.acos),
  acosh: unary(Math.acosh),
  acot: unary((value) => Math.atan(1 / value)),
  acoth: unary(computeInverseCoth),
  acsc: unary((value) => Math.asin(1 / value)),
  acsch: unary((value) => Math.asinh(1 / value)),
  add: variadic(2, (...values) => sum(values)),
  addScalar: binary((left, right) => left + right),
  and: variadic(2, (...values) => toNumber(values.every((value) => checkIsTruthy(value)))),
  arg: unary((value) => (Number.isNaN(value) ? Number.NaN : value < 0 ? Math.PI : 0)),
  asec: unary((value) => Math.acos(1 / value)),
  asech: unary((value) => Math.acosh(1 / value)),
  asin: unary(Math.asin),
  asinh: unary(Math.asinh),
  atan: unary(Math.atan),
  atan2: binary((left, right) => Math.atan2(left, right)),
  atanh: unary(Math.atanh),
  bellNumbers: unary(computeBellNumber),
  bernoulli: unary((value) => (Number.isInteger(value) && value >= 0 ? computeBernoulliNumber(value) : null)),
  // Mathjs answers a zero left operand of bitAnd, and a -1 left operand of bitOr, without reading the right operand
  bitAnd: binary((left, right) => {
    if (left === 0) return 0;
    return Number.isInteger(left) && Number.isInteger(right) ? left & right : null;
  }),
  bitNot: integerUnary((value) => ~value),
  bitOr: binary((left, right) => {
    if (left === -1) return -1;
    return Number.isInteger(left) && Number.isInteger(right) ? left | right : null;
  }),
  bitXor: integerBinary((left, right) => left ^ right),
  boolean: ranged(0, 1, (...values) => (values.length === 0 ? 0 : toNumber(checkIsTruthy(values[0] ?? 0)))),
  catalan: unary(computeCatalan),
  cbrt: unary(Math.cbrt),
  ceil: digitally(Math.ceil),
  clone: unary((value) => value),
  combinations: binary((available, chosen) =>
    Number.isInteger(available) && Number.isInteger(chosen) && chosen >= 0 && chosen <= available
      ? computeCombinations(available, chosen)
      : null,
  ),
  combinationsWithRep: binary((available, chosen) =>
    Number.isInteger(available) && Number.isInteger(chosen) && available >= 1 && chosen >= 0
      ? computeCombinations(available + chosen - 1, chosen)
      : null,
  ),
  compare: binary(computeComparison),
  compareNatural: binary(computeComparison),
  composition: binary(computeCompositions),
  conj: unary((value) => value),
  cos: unary(Math.cos),
  cosh: unary(Math.cosh),
  cot: unary((value) => 1 / Math.tan(value)),
  coth: unary((value) => 1 / Math.tanh(value)),
  count: variadic(0, (...values) => values.length, Only),
  csc: unary((value) => 1 / Math.sin(value)),
  csch: unary((value) => 1 / Math.sinh(value)),
  ctranspose: unary((value) => value),
  cube: unary((value) => value * value * value),
  deepEqual: binary((left, right) => toNumber(checkIsNearlyEqual(left, right))),
  det: unary((value) => value, Argument),
  divide: binary((left, right) => left / right),
  divideScalar: binary((left, right) => left / right),
  dotDivide: binary((left, right) => left / right),
  dotMultiply: binary((left, right) => left * right),
  dotPow: binary((left, right) => left ** right),
  equal: binary((left, right) => toNumber(checkIsNearlyEqual(left, right))),
  equalScalar: binary((left, right) => toNumber(checkIsNearlyEqual(left, right))),
  erf: unary(computeErf),
  erfinv: unary(computeErfInverse),
  exp: unary(Math.exp),
  expm1: unary(Math.expm1),
  factorial: unary(computeFactorial),
  fix: digitally(Math.trunc),
  floor: digitally(Math.floor),
  gamma: unary(computeGamma),
  gcd: variadic(2, (...values) => (values.length < 2 ? null : computeIntegerGreatestCommonDivisor(values)), Spread),
  hypot: variadic(1, (...values) => Math.hypot(...values), Spread),
  im: unary(() => 0),
  inv: unary((value) => 1 / value),
  invmod: binary(computeModularInverse),
  isBounded: unary((value) => toNumber(Number.isFinite(value))),
  isFinite: unary((value) => toNumber(Number.isFinite(value))),
  isInteger: unary((value) => toNumber(Number.isInteger(value))),
  isNaN: unary((value) => toNumber(Number.isNaN(value))),
  isNegative: unary((value) => toNumber(value < 0)),
  isPositive: unary((value) => toNumber(value > 0)),
  isPrime: unary((value) => toNumber(computeIsPrime(value))),
  isZero: unary((value) => toNumber(value === 0)),
  larger: binary((left, right) => toNumber(left > right && !checkIsNearlyEqual(left, right))),
  largerEq: binary((left, right) => toNumber(left >= right || checkIsNearlyEqual(left, right))),
  lcm: variadic(2, (...values) => {
    const [first = Number.NaN, ...rest] = values;
    return rest.reduce<null | number>(
      (total, value) => (total === null ? null : computeLeastCommonMultiple(total, value)),
      first,
    );
  }),
  leftShift: integerBinary((left, right) => left << right),
  lgamma: unary(computeLogGamma),
  log: ranged(1, 2, (...values) => computeLogarithm(values[0] ?? Number.NaN, values[1])),
  log1p: ranged(1, 2, (...values) => {
    const [value = Number.NaN, base] = values;
    return base === undefined ? Math.log1p(value) : Math.log1p(value) / Math.log(base);
  }),
  log2: unary(Math.log2),
  log10: unary(Math.log10),
  mad: variadic(1, ofNonEmpty(medianAbsoluteDeviation), Spread),
  max: variadic(
    1,
    ofNonEmpty((values) => Math.max(...values)),
    Spread,
  ),
  mean: variadic(1, ofNonEmpty(mean), Spread),
  median: variadic(1, ofNonEmpty(median), Spread),
  min: variadic(
    1,
    ofNonEmpty((values) => Math.min(...values)),
    Spread,
  ),
  mod: binary((left, right) => computeModulo(left, right)),
  multinomial: variadic(0, computeMultinomial, Only),
  multiply: variadic(2, (...values) => values.reduce((total, value) => total * value, 1)),
  multiplyScalar: binary((left, right) => left * right),
  norm: fixed(1, computeNorm, Spread),
  not: unary((value) => toNumber(!checkIsTruthy(value))),
  nthRoot: ranged(1, 2, (...values) => computeNthRoot(values[0] ?? Number.NaN, values[1] ?? 2)),
  nullish: binary((left) => left),
  number: ranged(0, 1, (...values) => (values.length === 0 ? 0 : (values[0] ?? Number.NaN))),
  numeric: unary((value) => value),
  or: variadic(2, (...values) => toNumber(countTruthy(values) > 0)),
  permutations: ranged(1, 2, (...values) => {
    const [available = Number.NaN, chosen = available] = values;
    return computePermutations(available, chosen);
  }),
  pinv: unary((value) => (value === 0 ? 0 : 1 / value)),
  pow: binary((left, right) => left ** right),
  prod: variadic(
    1,
    ofNonEmpty((values) => values.reduce((total, value) => total * value, 1)),
    Spread,
  ),
  re: unary((value) => value),
  rightArithShift: integerBinary((left, right) => left >> right),
  rightLogShift: integerBinary((left, right) => left >>> right),
  round: digitally((value) => Math.sign(value) * Math.round(Math.abs(value))),
  sec: unary((value) => 1 / Math.cos(value)),
  sech: unary((value) => 1 / Math.cosh(value)),
  sign: unary(Math.sign),
  sin: unary(Math.sin),
  sinh: unary(Math.sinh),
  smaller: binary((left, right) => toNumber(left < right && !checkIsNearlyEqual(left, right))),
  smallerEq: binary((left, right) => toNumber(left <= right || checkIsNearlyEqual(left, right))),
  sqrt: unary(Math.sqrt),
  square: unary((value) => value * value),
  squeeze: unary((value) => value, Argument),
  std: variadic(
    1,
    ofNonEmpty((values) => Math.sqrt(variance(values))),
    Spread,
  ),
  stirlingS2: binary(computeStirlingSecondKind),
  subtract: binary((left, right) => left - right),
  subtractScalar: binary((left, right) => left - right),
  sum: variadic(1, (...values) => sum(values), Spread),
  tan: unary(Math.tan),
  tanh: unary(Math.tanh),
  trace: unary((value) => value, Argument),
  transpose: unary((value) => value, Argument),
  unaryMinus: unary((value) => -value),
  unaryPlus: unary((value) => value),
  unequal: binary((left, right) => toNumber(!checkIsNearlyEqual(left, right))),
  variance: variadic(
    1,
    ofNonEmpty((values) => variance(values)),
    Spread,
  ),
  xor: variadic(2, (...values) => toNumber(countTruthy(values) % 2 === 1)),
  zeta: unary(computeZeta),
};
