import { computeDetailStatistics } from "#src/services/shared/computeDetailStatistics";

// How far one surface's statistics stand from another's, as the root mean square of each statistic's relative error
// Over the statistics the reference holds: 0 the same distribution of detail, 1 a surface with none where the reference
// Has some. A statistic the reference holds none of is left out. Each image is read over its own mask
export const computeStatisticalStructure = (
  reference: Float32Array,
  shot: Float32Array,
  referenceMask: Uint8Array,
  shotMask: Uint8Array,
  width: number,
  height: number,
): number => {
  const referenceStatistics = computeDetailStatistics(reference, referenceMask, width, height);
  const shotStatistics = computeDetailStatistics(shot, shotMask, width, height);
  const errors = referenceStatistics.flatMap((statistic, index) =>
    statistic > 0 ? [((shotStatistics[index] ?? 0) - statistic) / statistic] : [],
  );
  if (errors.length === 0) return 0;
  return Math.sqrt(errors.reduce((sum, error) => sum + error ** 2, 0) / errors.length);
};
