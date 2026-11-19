// One statistic of a surface's structure: its index among the statistics (0 the luminance's variance, then each octave
// Band finest first), the reference's and our value, and the relative error between them. A statistic the reference
// Holds none of is left out, since no relative error reads against nothing
export interface StructureTerm {
  error: number;
  index: number;
  reference: number;
  shot: number;
}

// The relative error of each statistic the reference holds, as `computeStructureError` takes its root mean square over
export const computeStructureTerms = (
  referenceStatistics: readonly number[],
  shotStatistics: readonly number[],
): StructureTerm[] =>
  referenceStatistics.flatMap((reference, index) => {
    const shot = shotStatistics[index] ?? 0;
    return reference > 0 ? [{ error: (shot - reference) / reference, index, reference, shot }] : [];
  });
