import type { MathExpressionSignature } from "#src/models/MathExpressionSignature";
import type { MathExpressionValue } from "#src/models/MathExpressionValue";

import { MathExpressionParameterType } from "#src/models/MathExpressionParameterType";
import { checkIsNearlyEqual } from "#src/services/checkIsNearlyEqual";
import { checkIsTruthy } from "#src/services/checkIsTruthy";
import { computeBernoulliNumber } from "#src/services/computeBernoulliNumber";
import { computeCombinations } from "#src/services/computeCombinations";
import { computeComparison } from "#src/services/computeComparison";
import { computeCorrelation } from "#src/services/computeCorrelation";
import { computeDeterminant } from "#src/services/computeDeterminant";
import { computeDistance } from "#src/services/computeDistance";
import { computeDotProduct } from "#src/services/computeDotProduct";
import { computeErf } from "#src/services/computeErf";
import { computeErfInverse } from "#src/services/computeErfInverse";
import { computeGamma } from "#src/services/computeGamma";
import { computeKullbackLeibler } from "#src/services/computeKullbackLeibler";
import { computeListComparison } from "#src/services/computeListComparison";
import { computeLogGamma } from "#src/services/computeLogGamma";
import { computeModularInverse } from "#src/services/computeModularInverse";
import { computeModulo } from "#src/services/computeModulo";
import { computeNthRoot } from "#src/services/computeNthRoot";
import { computePartitionSelect } from "#src/services/computePartitionSelect";
import { computeProduct } from "#src/services/computeProduct";
import { computeQuantile } from "#src/services/computeQuantile";
import { computeVectorNorm } from "#src/services/computeVectorNorm";
import { computeZeta } from "#src/services/computeZeta";
import { shiftDecimalPlaces } from "#src/services/shiftDecimalPlaces";
import { toNumber } from "#src/services/toNumber";

// A function of the table is keyed by its mathjs name, and is the signatures it takes: each one's parameter kinds, its
// Arities and its computation. A computation yields null where mathjs would throw, which the evaluation turns into an error
const MAXIMUM_DIGITS = 15;

const countTruthy = (values: number[]): number => values.filter((value) => checkIsTruthy(value)).length;

// The numbers a call's values hold, where a list of numbers stands for its numbers
const toNumbers = (values: MathExpressionValue[]): number[] => values.flat();
const signature = (
  parameters: MathExpressionParameterType[],
  minArity: number,
  maxArity: number,
  compute: (...values: MathExpressionValue[]) => null | number,
): MathExpressionSignature => ({ compute, maxArity, minArity, parameters });
const numeric =
  (compute: (...values: number[]) => null | number) =>
  (...values: MathExpressionValue[]) =>
    compute(...toNumbers(values));
const numberSignature = (
  minArity: number,
  maxArity: number,
  compute: (...values: number[]) => null | number,
): MathExpressionSignature => signature([MathExpressionParameterType.Number], minArity, maxArity, numeric(compute));
const listSignature = (compute: (...values: number[]) => null | number): MathExpressionSignature =>
  signature([MathExpressionParameterType.List], 1, 1, numeric(compute));
// A function of lists takes each argument as the list of its numbers, a number standing for a list of one
const ofLists =
  (compute: (...lists: number[][]) => null | number) =>
  (...values: MathExpressionValue[]): null | number =>
    compute(...values.map((value) => toNumbers([value])));

const listPairSignature = (compute: (left: number[], right: number[]) => null | number): MathExpressionSignature =>
  signature([MathExpressionParameterType.List, MathExpressionParameterType.List], 2, 2, ofLists(compute));
// A pair of lists, or a list and a number, where the number is read as a list of one
const orderedListSignatures = (
  compute: (left: number[], right: number[]) => null | number,
): MathExpressionSignature[] => [
  signature([MathExpressionParameterType.Number, MathExpressionParameterType.List], 2, 2, ofLists(compute)),
  signature([MathExpressionParameterType.List, MathExpressionParameterType.Number], 2, 2, ofLists(compute)),
  listPairSignature(compute),
];

// A function of one argument takes only a list of one number, the list form every such function of mathjs's takes
const singletonListSignature = (compute: (value: number) => null | number): MathExpressionSignature =>
  signature([MathExpressionParameterType.List], 1, 1, (...values) => {
    const numbers = toNumbers(values);
    return numbers.length === 1 ? compute(numbers[0] ?? Number.NaN) : null;
  });

const fixed = (arity: number, compute: (...values: number[]) => null | number): MathExpressionSignature[] => [
  numberSignature(arity, arity, compute),
];
const ranged = (
  minArity: number,
  maxArity: number,
  compute: (...values: number[]) => null | number,
): MathExpressionSignature[] => [numberSignature(minArity, maxArity, compute)];
const variadic = (minArity: number, compute: (...values: number[]) => null | number): MathExpressionSignature[] => [
  numberSignature(minArity, Number.POSITIVE_INFINITY, compute),
];
// A spread function also takes one list, whose numbers are its arguments
const spread = (minArity: number, compute: (...values: number[]) => null | number): MathExpressionSignature[] => [
  numberSignature(minArity, Number.POSITIVE_INFINITY, compute),
  listSignature(compute),
];
const unary = (compute: (value: number) => null | number): MathExpressionSignature[] =>
  fixed(1, (...values) => compute(values[0] ?? Number.NaN));
// A function that is the identity on a number, which takes a list of one number as its number
const identity = (): MathExpressionSignature[] => [
  ...unary((value) => value),
  singletonListSignature((value) => value),
];
// A list argument leads a function's arguments, and any numbers after it follow the list, as mathjs takes them
const withList =
  (compute: (list: number[], ...numbers: number[]) => null | number) =>
  (...values: MathExpressionValue[]): null | number =>
    compute(toNumbers(values.slice(0, 1)), ...toNumbers(values.slice(1)));
// A number leads a function's arguments and a list follows it
const withNumberThenList =
  (compute: (value: number, list: number[]) => null | number) =>
  (...values: MathExpressionValue[]): null | number =>
    compute(toNumbers(values.slice(0, 1))[0] ?? Number.NaN, toNumbers(values.slice(1)));
// A bitwise function folds its operands left to right. An operand that decides the result, zero for and and minus one for
// Or, ends the fold without the operands after it being read, and an operand that is not an integer is an error
const bitwiseFold =
  (absorbing: number, compute: (left: number, right: number) => number) =>
  (...values: number[]): null | number => {
    let result = values[0] ?? Number.NaN;
    for (const value of values.slice(1)) {
      if (result === absorbing) return absorbing;
      if (!Number.isInteger(result) || !Number.isInteger(value)) return null;

      result = compute(result, value);
    }
    return result;
  };
const binary = (compute: (left: number, right: number) => null | number): MathExpressionSignature[] =>
  fixed(2, (...values) => compute(values[0] ?? Number.NaN, values[1] ?? Number.NaN));
const integerBinary = (compute: (left: number, right: number) => null | number): MathExpressionSignature[] =>
  binary((left, right) => (Number.isInteger(left) && Number.isInteger(right) ? compute(left, right) : null));
const integerUnary = (compute: (value: number) => null | number): MathExpressionSignature[] =>
  unary((value) => (Number.isInteger(value) ? compute(value) : null));
const digitally = (rounder: (value: number) => number): MathExpressionSignature[] =>
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

export const MathExpressionFunctionMap: Record<string, MathExpressionSignature[]> = {
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
  bitAnd: variadic(
    2,
    bitwiseFold(0, (left, right) => left & right),
  ),
  bitNot: integerUnary((value) => ~value),
  bitOr: variadic(
    2,
    bitwiseFold(-1, (left, right) => left | right),
  ),
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
  compareNatural: [...binary(computeComparison), ...orderedListSignatures(computeListComparison)],
  composition: binary(computeCompositions),
  conj: unary((value) => value),
  corr: [listPairSignature(computeCorrelation)],
  cos: unary(Math.cos),
  cosh: unary(Math.cosh),
  cot: unary((value) => 1 / Math.tan(value)),
  coth: unary((value) => 1 / Math.tanh(value)),
  count: [listSignature((...values) => values.length)],
  csc: unary((value) => 1 / Math.sin(value)),
  csch: unary((value) => 1 / Math.sinh(value)),
  ctranspose: unary((value) => value),
  cube: unary((value) => value * value * value),
  deepEqual: [
    ...binary((left, right) => toNumber(checkIsNearlyEqual(left, right))),
    listPairSignature((left, right) =>
      toNumber(
        left.length === right.length &&
          left.every((value, index) => checkIsNearlyEqual(value, right[index] ?? Number.NaN)),
      ),
    ),
    // A number and a list are never equal, as mathjs answers
    signature([MathExpressionParameterType.Number, MathExpressionParameterType.List], 2, 2, () => toNumber(false)),
    signature([MathExpressionParameterType.List, MathExpressionParameterType.Number], 2, 2, () => toNumber(false)),
  ],
  det: [...unary((value) => value), listSignature((...values) => computeDeterminant(values))],
  distance: [listPairSignature(computeDistance)],
  divide: binary((left, right) => left / right),
  divideScalar: binary((left, right) => left / right),
  dot: [listPairSignature(computeDotProduct)],
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
  gcd: spread(2, (...values) => (values.length < 2 ? null : computeIntegerGreatestCommonDivisor(values))),
  hypot: spread(1, (...values) => Math.hypot(...values)),
  im: unary(() => 0),
  inv: unary((value) => 1 / value),
  invmod: binary(computeModularInverse),
  isBounded: [
    ...unary((value) => toNumber(Number.isFinite(value))),
    listSignature((...values) => toNumber(values.every((value) => Number.isFinite(value)))),
  ],
  isFinite: unary((value) => toNumber(Number.isFinite(value))),
  isInteger: unary((value) => toNumber(Number.isInteger(value))),
  isNaN: unary((value) => toNumber(Number.isNaN(value))),
  isNegative: unary((value) => toNumber(value < 0)),
  isPositive: unary((value) => toNumber(value > 0)),
  isPrime: unary((value) => toNumber(computeIsPrime(value))),
  isZero: unary((value) => toNumber(value === 0)),
  kldivergence: [listPairSignature(computeKullbackLeibler)],
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
  mad: spread(1, ofNonEmpty(medianAbsoluteDeviation)),
  max: spread(
    1,
    ofNonEmpty((values) => Math.max(...values)),
  ),
  mean: spread(1, ofNonEmpty(mean)),
  median: spread(1, ofNonEmpty(median)),
  min: spread(
    1,
    ofNonEmpty((values) => Math.min(...values)),
  ),
  mod: binary((left, right) => computeModulo(left, right)),
  multinomial: [listSignature(computeMultinomial)],
  multiply: [
    ...variadic(2, (...values) => values.reduce((total, value) => total * value, 1)),
    listPairSignature(computeDotProduct),
    signature([MathExpressionParameterType.Any], 2, Number.POSITIVE_INFINITY, (...values) => computeProduct(values)),
  ],
  multiplyScalar: binary((left, right) => left * right),
  norm: [
    ...fixed(1, computeNorm),
    listSignature(computeNorm),
    signature(
      [MathExpressionParameterType.List, MathExpressionParameterType.Number],
      2,
      2,
      withList((list, ...powers) => computeVectorNorm(list, powers[0] ?? Number.NaN)),
    ),
  ],
  not: unary((value) => toNumber(!checkIsTruthy(value))),
  nthRoot: ranged(1, 2, (...values) => computeNthRoot(values[0] ?? Number.NaN, values[1] ?? 2)),
  nullish: variadic(1, (...values) => values[0] ?? Number.NaN),
  number: ranged(0, 1, (...values) => (values.length === 0 ? 0 : (values[0] ?? Number.NaN))),
  numeric: unary((value) => value),
  or: variadic(1, (...values) => toNumber(countTruthy(values) > 0)),
  partitionSelect: [
    signature(
      [MathExpressionParameterType.List, MathExpressionParameterType.Number],
      2,
      2,
      withList((list, index = Number.NaN) => computePartitionSelect(list, index)),
    ),
  ],
  permutations: ranged(1, 2, (...values) => {
    const [available = Number.NaN, chosen = available] = values;
    return computePermutations(available, chosen);
  }),
  pinv: unary((value) => (value === 0 ? 0 : 1 / value)),
  pow: binary((left, right) => left ** right),
  prod: spread(
    1,
    ofNonEmpty((values) => values.reduce((total, value) => total * value, 1)),
  ),
  quantileSeq: [
    signature(
      [MathExpressionParameterType.List, MathExpressionParameterType.Number],
      2,
      3,
      withList((list, probability = Number.NaN, sorted = 0) =>
        computeQuantile(list, probability, checkIsTruthy(sorted)),
      ),
    ),
  ],
  re: unary((value) => value),
  rightArithShift: integerBinary((left, right) => left >> right),
  rightLogShift: integerBinary((left, right) => left >>> right),
  round: digitally((value) => Math.sign(value) * Math.round(Math.abs(value))),
  sec: unary((value) => 1 / Math.cos(value)),
  sech: unary((value) => 1 / Math.cosh(value)),
  setIsSubset: [listPairSignature((left, right) => toNumber(left.every((value) => right.includes(value))))],
  setMultiplicity: [
    signature(
      [MathExpressionParameterType.Number, MathExpressionParameterType.List],
      2,
      2,
      withNumberThenList((value, list) => list.filter((element) => element === value).length),
    ),
  ],
  setSize: [listSignature((...values) => values.length)],
  sign: unary(Math.sign),
  sin: unary(Math.sin),
  sinh: unary(Math.sinh),
  smaller: binary((left, right) => toNumber(left < right && !checkIsNearlyEqual(left, right))),
  smallerEq: binary((left, right) => toNumber(left <= right || checkIsNearlyEqual(left, right))),
  sqrt: unary(Math.sqrt),
  square: unary((value) => value * value),
  squeeze: identity(),
  std: spread(
    1,
    ofNonEmpty((values) => Math.sqrt(variance(values))),
  ),
  stirlingS2: binary(computeStirlingSecondKind),
  subtract: binary((left, right) => left - right),
  subtractScalar: binary((left, right) => left - right),
  sum: spread(1, (...values) => sum(values)),
  tan: unary(Math.tan),
  tanh: unary(Math.tanh),
  trace: identity(),
  transpose: identity(),
  unaryMinus: unary((value) => -value),
  unaryPlus: unary((value) => value),
  unequal: binary((left, right) => toNumber(!checkIsNearlyEqual(left, right))),
  variance: spread(
    1,
    ofNonEmpty((values) => variance(values)),
  ),
  xor: variadic(2, (...values) => toNumber(countTruthy(values) % 2 === 1)),
  zeta: unary(computeZeta),
};
