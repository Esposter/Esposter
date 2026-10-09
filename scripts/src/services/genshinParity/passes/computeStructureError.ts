// How far one surface's statistics stand from another's, as the root mean square of each statistic's relative error
// Over the statistics the reference holds: 0 the same distribution of detail, 1 a surface with none where the reference
// Has some. A statistic the reference holds none of is left out
export const computeStructureError = (
  referenceStatistics: readonly number[],
  shotStatistics: readonly number[],
): number => {
  const errors = referenceStatistics.flatMap((statistic, index) =>
    statistic > 0 ? [((shotStatistics[index] ?? 0) - statistic) / statistic] : [],
  );
  if (errors.length === 0) return 0;
  return Math.sqrt(errors.reduce((sum, error) => sum + error ** 2, 0) / errors.length);
};
