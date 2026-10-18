import type { MathExpressionNumberCompute } from "#src/models/function/MathExpressionNumberCompute";
import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";
import type { MathExpressionValue } from "#src/models/function/MathExpressionValue";

import { MathExpressionParameterType } from "#src/models/function/MathExpressionParameterType";
import { checkIsLarger } from "#src/services/function/checkIsLarger";
import { checkIsNearlyEqual } from "#src/services/function/checkIsNearlyEqual";
import { checkIsPrime } from "#src/services/function/checkIsPrime";
import { checkIsSmaller } from "#src/services/function/checkIsSmaller";
import { checkIsTruthy } from "#src/services/shared/checkIsTruthy";
import { computeBellNumber } from "#src/services/function/computeBellNumber";
import { computeBernoulliNumber } from "#src/services/function/computeBernoulliNumber";
import { computeCatalan } from "#src/services/function/computeCatalan";
import { computeCombinations } from "#src/services/function/computeCombinations";
import { computeComparison } from "#src/services/function/computeComparison";
import { computeCompositions } from "#src/services/function/computeCompositions";
import { computeCorrelation } from "#src/services/function/computeCorrelation";
import { computeDeterminant } from "#src/services/function/computeDeterminant";
import { computeDistance } from "#src/services/function/computeDistance";
import { computeDotProduct } from "#src/services/function/computeDotProduct";
import { computeErf } from "#src/services/function/computeErf";
import { computeErfInverse } from "#src/services/function/computeErfInverse";
import { computeExtreme } from "#src/services/function/computeExtreme";
import { computeFactorial } from "#src/services/function/computeFactorial";
import { computeGamma } from "#src/services/function/computeGamma";
import { computeHypotenuse } from "#src/services/function/computeHypotenuse";
import { computeIntegerGreatestCommonDivisor } from "#src/services/function/computeIntegerGreatestCommonDivisor";
import { computeInverseCoth } from "#src/services/function/computeInverseCoth";
import { computeKullbackLeibler } from "#src/services/function/computeKullbackLeibler";
import { computeLeastCommonMultiple } from "#src/services/function/computeLeastCommonMultiple";
import { computeListComparison } from "#src/services/function/computeListComparison";
import { computeLogarithm } from "#src/services/function/computeLogarithm";
import { computeLogGamma } from "#src/services/function/computeLogGamma";
import { computeMean } from "#src/services/function/computeMean";
import { computeMedian } from "#src/services/function/computeMedian";
import { computeMedianAbsoluteDeviation } from "#src/services/function/computeMedianAbsoluteDeviation";
import { computeModularInverse } from "#src/services/function/computeModularInverse";
import { computeModulo } from "#src/services/function/computeModulo";
import { computeMultinomial } from "#src/services/function/computeMultinomial";
import { computeNorm } from "#src/services/function/computeNorm";
import { computeNthRoot } from "#src/services/function/computeNthRoot";
import { computePartitionSelect } from "#src/services/function/computePartitionSelect";
import { computePermutations } from "#src/services/function/computePermutations";
import { computeProduct } from "#src/services/function/computeProduct";
import { computeQuantile } from "#src/services/function/computeQuantile";
import { computeStirlingSecondKind } from "#src/services/function/computeStirlingSecondKind";
import { computeSum } from "#src/services/function/computeSum";
import { computeVariance } from "#src/services/function/computeVariance";
import { computeVectorNorm } from "#src/services/function/computeVectorNorm";
import { computeZeta } from "#src/services/function/computeZeta";
import { MAXIMUM_DIGITS } from "#src/services/function/constants";
import { shiftDecimalPlaces } from "#src/services/function/shiftDecimalPlaces";
import { toNumber } from "#src/services/shared/toNumber";

const countTruthy = (values: readonly number[]): number => values.filter((value) => checkIsTruthy(value)).length;
// The numbers a call's values hold, where a list of numbers stands for its numbers
const toNumbers = (values: readonly MathExpressionValue[]): number[] => values.flat();
const signature = (
  parameters: MathExpressionParameterType[],
  minArity: number,
  maxArity: number,
  compute: MathExpressionSignature["compute"],
): MathExpressionSignature => ({ compute, maxArity, minArity, parameters });
const numeric =
  (compute: MathExpressionNumberCompute): MathExpressionSignature["compute"] =>
  (values) =>
    compute(toNumbers(values));
const numberSignature = (
  minArity: number,
  maxArity: number,
  compute: MathExpressionNumberCompute,
): MathExpressionSignature => signature([MathExpressionParameterType.Number], minArity, maxArity, numeric(compute));
const listSignature = (compute: MathExpressionNumberCompute): MathExpressionSignature =>
  signature([MathExpressionParameterType.List], 1, 1, numeric(compute));
// A function of two lists takes each argument as the list of its numbers, a number standing for a list of one
const ofListPair =
  (compute: (left: number[], right: number[]) => null | number): MathExpressionSignature["compute"] =>
  (values) =>
    compute(toNumbers(values.slice(0, 1)), toNumbers(values.slice(1, 2)));

const listPairSignature = (compute: (left: number[], right: number[]) => null | number): MathExpressionSignature =>
  signature([MathExpressionParameterType.List, MathExpressionParameterType.List], 2, 2, ofListPair(compute));
// A pair of lists, or a list and a number, where the number is read as a list of one
const orderedListSignatures = (
  compute: (left: number[], right: number[]) => null | number,
): MathExpressionSignature[] => [
  signature([MathExpressionParameterType.Number, MathExpressionParameterType.List], 2, 2, ofListPair(compute)),
  signature([MathExpressionParameterType.List, MathExpressionParameterType.Number], 2, 2, ofListPair(compute)),
  listPairSignature(compute),
];
// A function of one argument takes only a list of one number, the list form every such function of mathjs's takes
const singletonListSignature = (compute: (value: number) => null | number): MathExpressionSignature =>
  listSignature((values) => (values.length === 1 ? compute(values[0] ?? Number.NaN) : null));

const fixed = (arity: number, compute: MathExpressionNumberCompute): MathExpressionSignature[] => [
  numberSignature(arity, arity, compute),
];
const ranged = (
  minArity: number,
  maxArity: number,
  compute: MathExpressionNumberCompute,
): MathExpressionSignature[] => [numberSignature(minArity, maxArity, compute)];
const variadic = (minArity: number, compute: MathExpressionNumberCompute): MathExpressionSignature[] => [
  numberSignature(minArity, Number.POSITIVE_INFINITY, compute),
];
// A spread function also takes one list, whose numbers are its arguments
const spread = (minArity: number, compute: MathExpressionNumberCompute): MathExpressionSignature[] => [
  numberSignature(minArity, Number.POSITIVE_INFINITY, compute),
  listSignature(compute),
];
const unary = (compute: (value: number) => null | number): MathExpressionSignature[] =>
  fixed(1, (values) => compute(values[0] ?? Number.NaN));
// A function that is the identity on a number, which takes a list of one number as its number
const identity = (): MathExpressionSignature[] => [
  ...unary((value) => value),
  singletonListSignature((value) => value),
];
// A list argument leads a function's arguments, and the numbers after it follow the list, as mathjs takes them
const withList =
  (compute: (list: number[], numbers: number[]) => null | number): MathExpressionSignature["compute"] =>
  (values) =>
    compute(toNumbers(values.slice(0, 1)), toNumbers(values.slice(1)));
// A number leads a function's arguments and a list follows it
const withNumberThenList =
  (compute: (value: number, list: number[]) => null | number): MathExpressionSignature["compute"] =>
  (values) =>
    compute(toNumbers(values.slice(0, 1))[0] ?? Number.NaN, toNumbers(values.slice(1)));
// A bitwise function folds its operands left to right. An operand that decides the result ends the fold early.
// The operands after it are never read. Zero decides an and, and minus one decides an or.
// An operand that is not an integer is an error
const bitwiseFold =
  (absorbing: number, compute: (left: number, right: number) => number): MathExpressionNumberCompute =>
  (values) => {
    let result = values[0] ?? Number.NaN;
    for (const value of values.slice(1)) {
      if (result === absorbing) return absorbing;
      if (!Number.isInteger(result) || !Number.isInteger(value)) return null;

      result = compute(result, value);
    }
    return result;
  };
const binary = (compute: (left: number, right: number) => null | number): MathExpressionSignature[] =>
  fixed(2, (values) => compute(values[0] ?? Number.NaN, values[1] ?? Number.NaN));
const integerBinary = (compute: (left: number, right: number) => null | number): MathExpressionSignature[] =>
  binary((left, right) => (Number.isInteger(left) && Number.isInteger(right) ? compute(left, right) : null));
const integerUnary = (compute: (value: number) => null | number): MathExpressionSignature[] =>
  unary((value) => (Number.isInteger(value) ? compute(value) : null));
const digitally = (rounder: (value: number) => number): MathExpressionSignature[] =>
  ranged(1, 2, (values) => {
    const [value = Number.NaN, digits = 0] = values;
    if (!Number.isInteger(digits) || digits < 0 || digits > MAXIMUM_DIGITS) return null;
    if (!Number.isFinite(value)) return value;
    return shiftDecimalPlaces(rounder(shiftDecimalPlaces(value, digits)), -digits);
  });
// A statistic of a list is undefined for an empty one, where mathjs throws
const ofNonEmpty =
  (compute: (values: readonly number[]) => number): MathExpressionNumberCompute =>
  (values) =>
    values.length === 0 ? null : compute(values);

// A function of the table is keyed by its mathjs name, and is the signatures it takes.
// Each signature gives its parameter kinds, its arities and its computation.
// A computation yields null where mathjs would throw, which the evaluation turns into an error
export const MathExpressionFunctionMap: Record<string, MathExpressionSignature[]> = {
  abs: unary(Math.abs),
  acos: unary(Math.acos),
  acosh: unary(Math.acosh),
  acot: unary((value) => Math.atan(1 / value)),
  acoth: unary(computeInverseCoth),
  acsc: unary((value) => Math.asin(1 / value)),
  acsch: unary((value) => Math.asinh(1 / value)),
  add: variadic(2, computeSum),
  addScalar: binary((left, right) => left + right),
  and: variadic(2, (values) => toNumber(values.every((value) => checkIsTruthy(value)))),
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
  boolean: ranged(0, 1, (values) => (values.length === 0 ? 0 : toNumber(checkIsTruthy(values[0] ?? 0)))),
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
  count: [listSignature((values) => values.length)],
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
  det: [...unary((value) => value), listSignature(computeDeterminant)],
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
  gcd: spread(2, (values) => (values.length < 2 ? null : computeIntegerGreatestCommonDivisor(values))),
  hypot: spread(1, computeHypotenuse),
  im: unary(() => 0),
  inv: unary((value) => 1 / value),
  invmod: binary(computeModularInverse),
  isBounded: [
    ...unary((value) => toNumber(Number.isFinite(value))),
    listSignature((values) => toNumber(values.every((value) => Number.isFinite(value)))),
  ],
  isFinite: unary((value) => toNumber(Number.isFinite(value))),
  isInteger: unary((value) => toNumber(Number.isInteger(value))),
  isNaN: unary((value) => toNumber(Number.isNaN(value))),
  isNegative: unary((value) => toNumber(value < 0)),
  isPositive: unary((value) => toNumber(value > 0)),
  isPrime: unary((value) => toNumber(checkIsPrime(value))),
  isZero: unary((value) => toNumber(value === 0)),
  kldivergence: [listPairSignature(computeKullbackLeibler)],
  larger: binary((left, right) => toNumber(checkIsLarger(left, right))),
  largerEq: binary((left, right) => toNumber(left >= right || checkIsNearlyEqual(left, right))),
  lcm: variadic(2, (values) => {
    const [first = Number.NaN, ...rest] = values;
    return rest.reduce<null | number>(
      (total, value) => (total === null ? null : computeLeastCommonMultiple(total, value)),
      first,
    );
  }),
  leftShift: integerBinary((left, right) => left << right),
  lgamma: unary(computeLogGamma),
  log: ranged(1, 2, (values) => computeLogarithm(values[0] ?? Number.NaN, values[1])),
  log1p: ranged(1, 2, (values) => {
    const [value = Number.NaN, base] = values;
    return base === undefined ? Math.log1p(value) : Math.log1p(value) / Math.log(base);
  }),
  log2: unary(Math.log2),
  log10: unary(Math.log10),
  mad: spread(1, ofNonEmpty(computeMedianAbsoluteDeviation)),
  max: spread(
    1,
    ofNonEmpty((values) => computeExtreme(values, values[0] ?? Number.NaN, checkIsLarger)),
  ),
  mean: spread(1, ofNonEmpty(computeMean)),
  median: spread(1, ofNonEmpty(computeMedian)),
  min: spread(
    1,
    ofNonEmpty((values) => computeExtreme(values, values[0] ?? Number.NaN, checkIsSmaller)),
  ),
  mod: binary((left, right) => computeModulo(left, right)),
  multinomial: [listSignature(computeMultinomial)],
  multiply: [
    ...variadic(2, (values) => values.reduce((total, value) => total * value, 1)),
    listPairSignature(computeDotProduct),
    signature([MathExpressionParameterType.Any], 2, Number.POSITIVE_INFINITY, computeProduct),
  ],
  multiplyScalar: binary((left, right) => left * right),
  norm: [
    ...fixed(1, computeNorm),
    listSignature(computeNorm),
    signature(
      [MathExpressionParameterType.List, MathExpressionParameterType.Number],
      2,
      2,
      withList((list, [power = Number.NaN]) => computeVectorNorm(list, power)),
    ),
  ],
  not: unary((value) => toNumber(!checkIsTruthy(value))),
  nthRoot: ranged(1, 2, (values) => computeNthRoot(values[0] ?? Number.NaN, values[1] ?? 2)),
  nullish: variadic(1, (values) => values[0] ?? Number.NaN),
  number: ranged(0, 1, (values) => (values.length === 0 ? 0 : (values[0] ?? Number.NaN))),
  numeric: unary((value) => value),
  or: variadic(1, (values) => toNumber(countTruthy(values) > 0)),
  partitionSelect: [
    signature(
      [MathExpressionParameterType.List, MathExpressionParameterType.Number],
      2,
      2,
      withList((list, [index = Number.NaN]) => computePartitionSelect(list, index)),
    ),
  ],
  permutations: ranged(1, 2, (values) => {
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
      withList((list, [probability = Number.NaN, sorted = 0]) =>
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
  setSize: [listSignature((values) => values.length)],
  sign: unary(Math.sign),
  sin: unary(Math.sin),
  sinh: unary(Math.sinh),
  smaller: binary((left, right) => toNumber(checkIsSmaller(left, right))),
  smallerEq: binary((left, right) => toNumber(left <= right || checkIsNearlyEqual(left, right))),
  sqrt: unary(Math.sqrt),
  square: unary((value) => value * value),
  squeeze: identity(),
  std: spread(
    1,
    ofNonEmpty((values) => Math.sqrt(computeVariance(values))),
  ),
  stirlingS2: binary(computeStirlingSecondKind),
  subtract: binary((left, right) => left - right),
  subtractScalar: binary((left, right) => left - right),
  sum: spread(1, computeSum),
  tan: unary(Math.tan),
  tanh: unary(Math.tanh),
  trace: identity(),
  transpose: identity(),
  unaryMinus: unary((value) => -value),
  unaryPlus: unary((value) => value),
  unequal: binary((left, right) => toNumber(!checkIsNearlyEqual(left, right))),
  variance: spread(1, ofNonEmpty(computeVariance)),
  xor: variadic(2, (values) => toNumber(countTruthy(values) % 2 === 1)),
  zeta: unary(computeZeta),
};
