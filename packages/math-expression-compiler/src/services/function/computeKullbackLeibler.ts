import { computeSum } from "#src/services/function/computeSum";

// The divergence of one distribution from another: each list is normalised to its sum, and the terms are summed as
// Mathjs sums them. Lists of different lengths, or with a zero sum, are an error
export const computeKullbackLeibler = (
  distribution: readonly number[],
  reference: readonly number[],
): null | number => {
  if (distribution.length !== reference.length) return null;

  const distributionSum = computeSum(distribution);
  const referenceSum = computeSum(reference);
  if (distributionSum === 0 || referenceSum === 0) return null;

  const normalizedDistribution = distribution.map((value) => value / distributionSum);
  const normalizedReference = reference.map((value) => value / referenceSum);
  return computeSum(
    normalizedDistribution.map((value, index) => value * Math.log(value / (normalizedReference[index] ?? Number.NaN))),
  );
};
