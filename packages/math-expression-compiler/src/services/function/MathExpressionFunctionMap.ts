import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import { MathExpressionParameterType } from "#src/models/function/MathExpressionParameterType";
import { checkIsLarger } from "#src/services/function/checkIsLarger";
import { checkIsNearlyEqual } from "#src/services/function/checkIsNearlyEqual";
import { checkIsPrime } from "#src/services/function/checkIsPrime";
import { checkIsSmaller } from "#src/services/function/checkIsSmaller";
import { computeBellNumber } from "#src/services/function/computeBellNumber";
import { computeBitwiseAnd } from "#src/services/function/computeBitwiseAnd";
import { computeBitwiseOr } from "#src/services/function/computeBitwiseOr";
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
import { computeTruthyCount } from "#src/services/function/computeTruthyCount";
import { computeVariance } from "#src/services/function/computeVariance";
import { computeVectorNorm } from "#src/services/function/computeVectorNorm";
import { computeZeta } from "#src/services/function/computeZeta";
import { createBinarySignatures } from "#src/services/function/signature/createBinarySignatures";
import { createBitwiseFold } from "#src/services/function/signature/createBitwiseFold";
import { createBitwisePair } from "#src/services/function/signature/createBitwisePair";
import { createDigitSignatures } from "#src/services/function/signature/createDigitSignatures";
import { createExtremeSignatures } from "#src/services/function/signature/createExtremeSignatures";
import { createIdentitySignatures } from "#src/services/function/signature/createIdentitySignatures";
import { createIntegerBinarySignatures } from "#src/services/function/signature/createIntegerBinarySignatures";
import { createIntegerUnarySignatures } from "#src/services/function/signature/createIntegerUnarySignatures";
import { createListFirstCompute } from "#src/services/function/signature/createListFirstCompute";
import { createListPairSignature } from "#src/services/function/signature/createListPairSignature";
import { createListSignature } from "#src/services/function/signature/createListSignature";
import { createNonEmptyCompute } from "#src/services/function/signature/createNonEmptyCompute";
import { createOrderedListSignatures } from "#src/services/function/signature/createOrderedListSignatures";
import { createRangedSignatures } from "#src/services/function/signature/createRangedSignatures";
import { createSignature } from "#src/services/function/signature/createSignature";
import { createSpreadSignatures } from "#src/services/function/signature/createSpreadSignatures";
import { createUnarySignatures } from "#src/services/function/signature/createUnarySignatures";
import { createVariadicSignatures } from "#src/services/function/signature/createVariadicSignatures";
import { checkIsTruthy } from "#src/services/shared/checkIsTruthy";
import { toNumber } from "#src/services/shared/toNumber";

// A function of the table is keyed by its mathjs name, and is the signatures it takes.
// Each signature gives its parameter kinds, its arities and its computation.
// A computation yields null where mathjs would throw, which the evaluation turns into an error
export const MathExpressionFunctionMap: Record<string, MathExpressionSignature[]> = {
  abs: createUnarySignatures(Math.abs),
  acos: createUnarySignatures(Math.acos),
  acosh: createUnarySignatures(Math.acosh),
  acot: createUnarySignatures((value) => Math.atan(1 / value)),
  acoth: createUnarySignatures(computeInverseCoth),
  acsc: createUnarySignatures((value) => Math.asin(1 / value)),
  acsch: createUnarySignatures((value) => Math.asinh(1 / value)),
  add: createVariadicSignatures(2, computeSum, (left, right) => left + right),
  addScalar: createBinarySignatures((left, right) => left + right),
  and: createVariadicSignatures(1, (values) => toNumber(values.every((value) => checkIsTruthy(value)))),
  arg: createUnarySignatures((value) => (Number.isNaN(value) ? Number.NaN : value < 0 ? Math.PI : 0)),
  asec: createUnarySignatures((value) => Math.acos(1 / value)),
  asech: createUnarySignatures((value) => Math.acosh(1 / value)),
  asin: createUnarySignatures(Math.asin),
  asinh: createUnarySignatures(Math.asinh),
  atan: createUnarySignatures(Math.atan),
  atan2: createBinarySignatures((left, right) => Math.atan2(left, right)),
  atanh: createUnarySignatures(Math.atanh),
  bellNumbers: createUnarySignatures(computeBellNumber),
  bernoulli: createUnarySignatures((value) =>
    Number.isInteger(value) && value >= 0 ? computeBernoulliNumber(value) : null,
  ),
  bitAnd: createVariadicSignatures(2, createBitwiseFold(0, computeBitwiseAnd), createBitwisePair(0, computeBitwiseAnd)),
  bitNot: createIntegerUnarySignatures((value) => ~value),
  bitOr: createVariadicSignatures(2, createBitwiseFold(-1, computeBitwiseOr), createBitwisePair(-1, computeBitwiseOr)),
  bitXor: createIntegerBinarySignatures((left, right) => left ^ right),
  boolean: createRangedSignatures(0, 1, (values) =>
    values.length === 0 ? 0 : toNumber(checkIsTruthy(values[0] ?? 0)),
  ),
  catalan: createUnarySignatures(computeCatalan),
  cbrt: createUnarySignatures(Math.cbrt),
  ceil: createDigitSignatures(Math.ceil),
  clone: createUnarySignatures((value) => value),
  combinations: createBinarySignatures((available, chosen) =>
    Number.isInteger(available) && Number.isInteger(chosen) && chosen >= 0 && chosen <= available
      ? computeCombinations(available, chosen)
      : null,
  ),
  combinationsWithRep: createBinarySignatures((available, chosen) =>
    Number.isInteger(available) && Number.isInteger(chosen) && available >= 1 && chosen >= 0
      ? computeCombinations(available + chosen - 1, chosen)
      : null,
  ),
  compare: createBinarySignatures(computeComparison),
  compareNatural: [...createBinarySignatures(computeComparison), ...createOrderedListSignatures(computeListComparison)],
  composition: createBinarySignatures(computeCompositions),
  conj: createUnarySignatures((value) => value),
  corr: [createListPairSignature(computeCorrelation)],
  cos: createUnarySignatures(Math.cos),
  cosh: createUnarySignatures(Math.cosh),
  cot: createUnarySignatures((value) => 1 / Math.tan(value)),
  coth: createUnarySignatures((value) => 1 / Math.tanh(value)),
  count: [createListSignature((values) => values.length)],
  csc: createUnarySignatures((value) => 1 / Math.sin(value)),
  csch: createUnarySignatures((value) => 1 / Math.sinh(value)),
  ctranspose: createUnarySignatures((value) => value),
  cube: createUnarySignatures((value) => value * value * value),
  deepEqual: [
    ...createBinarySignatures((left, right) => toNumber(checkIsNearlyEqual(left, right))),
    createListPairSignature((left, right) =>
      toNumber(
        left.length === right.length &&
          left.every((value, index) => checkIsNearlyEqual(value, right[index] ?? Number.NaN)),
      ),
    ),
    // A number and a list are never equal, as mathjs answers
    createSignature([MathExpressionParameterType.Number, MathExpressionParameterType.List], 2, 2, () =>
      toNumber(false),
    ),
    createSignature([MathExpressionParameterType.List, MathExpressionParameterType.Number], 2, 2, () =>
      toNumber(false),
    ),
  ],
  det: [...createUnarySignatures((value) => value), createListSignature(computeDeterminant)],
  distance: [createListPairSignature(computeDistance)],
  divide: createBinarySignatures((left, right) => left / right),
  divideScalar: createBinarySignatures((left, right) => left / right),
  dot: [createListPairSignature(computeDotProduct)],
  dotDivide: createBinarySignatures((left, right) => left / right),
  dotMultiply: createBinarySignatures((left, right) => left * right),
  dotPow: createBinarySignatures((left, right) => left ** right),
  equal: createBinarySignatures((left, right) => toNumber(checkIsNearlyEqual(left, right))),
  equalScalar: createBinarySignatures((left, right) => toNumber(checkIsNearlyEqual(left, right))),
  erf: createUnarySignatures(computeErf),
  erfinv: createUnarySignatures(computeErfInverse),
  exp: createUnarySignatures(Math.exp),
  expm1: createUnarySignatures(Math.expm1),
  factorial: createUnarySignatures(computeFactorial),
  fix: createDigitSignatures(Math.trunc),
  floor: createDigitSignatures(Math.floor),
  gamma: createUnarySignatures(computeGamma),
  gcd: createSpreadSignatures(2, (values) => (values.length < 2 ? null : computeIntegerGreatestCommonDivisor(values))),
  hypot: createSpreadSignatures(1, computeHypotenuse),
  im: createUnarySignatures(() => 0),
  inv: createUnarySignatures((value) => 1 / value),
  invmod: createBinarySignatures(computeModularInverse),
  isBounded: [
    ...createUnarySignatures((value) => toNumber(Number.isFinite(value))),
    createListSignature((values) => toNumber(values.every((value) => Number.isFinite(value)))),
  ],
  isFinite: createUnarySignatures((value) => toNumber(Number.isFinite(value))),
  isInteger: createUnarySignatures((value) => toNumber(Number.isInteger(value))),
  isNaN: createUnarySignatures((value) => toNumber(Number.isNaN(value))),
  isNegative: createUnarySignatures((value) => toNumber(value < 0)),
  isPositive: createUnarySignatures((value) => toNumber(value > 0)),
  isPrime: createUnarySignatures((value) => toNumber(checkIsPrime(value))),
  isZero: createUnarySignatures((value) => toNumber(value === 0)),
  kldivergence: [createListPairSignature(computeKullbackLeibler)],
  larger: createBinarySignatures((left, right) => toNumber(checkIsLarger(left, right))),
  largerEq: createBinarySignatures((left, right) => toNumber(left >= right || checkIsNearlyEqual(left, right))),
  lcm: createVariadicSignatures(2, (values) => {
    const [first = Number.NaN, ...rest] = values;
    return rest.reduce<null | number>(
      (total, value) => (total === null ? null : computeLeastCommonMultiple(total, value)),
      first,
    );
  }),
  leftShift: createIntegerBinarySignatures((left, right) => left << right),
  lgamma: createUnarySignatures(computeLogGamma),
  log: createRangedSignatures(1, 2, (values) => computeLogarithm(values[0] ?? Number.NaN, values[1])),
  log1p: createRangedSignatures(1, 2, (values) => {
    const [value = Number.NaN, base] = values;
    return base === undefined ? Math.log1p(value) : Math.log1p(value) / Math.log(base);
  }),
  log2: createUnarySignatures(Math.log2),
  log10: createUnarySignatures(Math.log10),
  mad: createSpreadSignatures(1, createNonEmptyCompute(computeMedianAbsoluteDeviation)),
  max: createExtremeSignatures(checkIsLarger),
  mean: createSpreadSignatures(1, createNonEmptyCompute(computeMean)),
  median: createSpreadSignatures(1, createNonEmptyCompute(computeMedian)),
  min: createExtremeSignatures(checkIsSmaller),
  mod: createBinarySignatures((left, right) => computeModulo(left, right)),
  multinomial: [createListSignature(computeMultinomial)],
  multiply: [
    ...createVariadicSignatures(
      2,
      (values) => values.reduce((total, value) => total * value, 1),
      (left, right) => left * right,
    ),
    createListPairSignature(computeDotProduct),
    createSignature([MathExpressionParameterType.Any], 2, Number.POSITIVE_INFINITY, computeProduct),
  ],
  multiplyScalar: createBinarySignatures((left, right) => left * right),
  norm: [
    ...createRangedSignatures(1, 1, computeNorm),
    createListSignature(computeNorm),
    createSignature(
      [MathExpressionParameterType.List, MathExpressionParameterType.Number],
      2,
      2,
      createListFirstCompute((list, [power = Number.NaN]) => computeVectorNorm(list, power)),
    ),
  ],
  not: createUnarySignatures((value) => toNumber(!checkIsTruthy(value))),
  nthRoot: createRangedSignatures(1, 2, (values) => computeNthRoot(values[0] ?? Number.NaN, values[1] ?? 2)),
  nullish: createVariadicSignatures(1, (values) => values[0] ?? Number.NaN),
  number: createRangedSignatures(0, 1, (values) => (values.length === 0 ? 0 : (values[0] ?? Number.NaN))),
  numeric: createUnarySignatures((value) => value),
  or: createVariadicSignatures(1, (values) => toNumber(computeTruthyCount(values) > 0)),
  partitionSelect: [
    createSignature(
      [MathExpressionParameterType.List, MathExpressionParameterType.Number],
      2,
      2,
      createListFirstCompute((list, [index = Number.NaN]) => computePartitionSelect(list, index)),
    ),
  ],
  permutations: createRangedSignatures(1, 2, (values) => {
    const [available = Number.NaN, chosen = available] = values;
    return computePermutations(available, chosen);
  }),
  pinv: createUnarySignatures((value) => (value === 0 ? 0 : 1 / value)),
  pow: createBinarySignatures((left, right) => left ** right),
  prod: createSpreadSignatures(
    1,
    createNonEmptyCompute((values) => values.reduce((total, value) => total * value, 1)),
  ),
  quantileSeq: [
    createSignature(
      [MathExpressionParameterType.List, MathExpressionParameterType.Number],
      2,
      3,
      createListFirstCompute((list, [probability = Number.NaN, sorted = 0]) =>
        computeQuantile(list, probability, checkIsTruthy(sorted)),
      ),
    ),
  ],
  re: createUnarySignatures((value) => value),
  rightArithShift: createIntegerBinarySignatures((left, right) => left >> right),
  rightLogShift: createIntegerBinarySignatures((left, right) => left >>> right),
  round: createDigitSignatures((value) => Math.sign(value) * Math.round(Math.abs(value))),
  sec: createUnarySignatures((value) => 1 / Math.cos(value)),
  sech: createUnarySignatures((value) => 1 / Math.cosh(value)),
  setIsSubset: [createListPairSignature((left, right) => toNumber(left.every((value) => right.includes(value))))],
  setMultiplicity: [
    createSignature(
      [MathExpressionParameterType.Number, MathExpressionParameterType.List],
      2,
      2,
      createListFirstCompute(([value = Number.NaN], list) => list.filter((element) => element === value).length),
    ),
  ],
  setSize: [createListSignature((values) => values.length)],
  sign: createUnarySignatures(Math.sign),
  sin: createUnarySignatures(Math.sin),
  sinh: createUnarySignatures(Math.sinh),
  smaller: createBinarySignatures((left, right) => toNumber(checkIsSmaller(left, right))),
  smallerEq: createBinarySignatures((left, right) => toNumber(left <= right || checkIsNearlyEqual(left, right))),
  sqrt: createUnarySignatures(Math.sqrt),
  square: createUnarySignatures((value) => value * value),
  squeeze: createIdentitySignatures(),
  std: createSpreadSignatures(
    1,
    createNonEmptyCompute((values) => Math.sqrt(computeVariance(values))),
  ),
  stirlingS2: createBinarySignatures(computeStirlingSecondKind),
  subtract: createBinarySignatures((left, right) => left - right),
  subtractScalar: createBinarySignatures((left, right) => left - right),
  sum: createSpreadSignatures(1, computeSum),
  tan: createUnarySignatures(Math.tan),
  tanh: createUnarySignatures(Math.tanh),
  trace: createIdentitySignatures(),
  transpose: createIdentitySignatures(),
  unaryMinus: createUnarySignatures((value) => -value),
  unaryPlus: createUnarySignatures((value) => value),
  unequal: createBinarySignatures((left, right) => toNumber(!checkIsNearlyEqual(left, right))),
  variance: createSpreadSignatures(1, createNonEmptyCompute(computeVariance)),
  xor: createVariadicSignatures(
    1,
    (values) => toNumber(computeTruthyCount(values) % 2 === 1),
    (left, right) => toNumber(checkIsTruthy(left) !== checkIsTruthy(right)),
  ),
  zeta: createUnarySignatures(computeZeta),
};
