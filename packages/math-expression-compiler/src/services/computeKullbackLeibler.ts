const sumOf = (values: number[]): number => values.reduce((total, value) => total + value, 0);

// The divergence of one distribution from another: each list is normalised to its sum, and the terms are summed as
// Mathjs sums them. Lists of different lengths, or with a zero sum, are an error
export const computeKullbackLeibler = (distribution: number[], reference: number[]): null | number => {
  if (distribution.length !== reference.length) return null;

  const distributionSum = sumOf(distribution);
  const referenceSum = sumOf(reference);
  if (distributionSum === 0 || referenceSum === 0) return null;

  const normalizedDistribution = distribution.map((value) => value / distributionSum);
  const normalizedReference = reference.map((value) => value / referenceSum);
  return sumOf(
    normalizedDistribution.map((value, index) => value * Math.log(value / (normalizedReference[index] ?? Number.NaN))),
  );
};
