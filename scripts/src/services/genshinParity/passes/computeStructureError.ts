import { computeStructureTerms } from "#src/services/genshinParity/passes/computeStructureTerms";

// How far one surface's statistics stand from another's, as the root mean square of each statistic's relative error
// Over the statistics the reference holds: 0 the same distribution of detail, 1 a surface with none where the reference
// Has some. A statistic the reference holds none of is left out
export const computeStructureError = (
  referenceStatistics: readonly number[],
  shotStatistics: readonly number[],
): number => {
  const terms = computeStructureTerms(referenceStatistics, shotStatistics);
  if (terms.length === 0) return 0;
  return Math.sqrt(terms.reduce((sum, { error }) => sum + error ** 2, 0) / terms.length);
};
