import { computeStructureError } from "#src/services/genshinParity/passes/computeStructureError";
import { computeDetailStatistics } from "#src/services/shared/computeDetailStatistics";

// The CPU reference of the statistics a surface's structure is scored by. The surface pass reads them on the parity
// Page's GPU instead, so only the unit test reads this, to check the definition the page must agree with
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
): number =>
  computeStructureError(
    computeDetailStatistics(reference, referenceMask, width, height),
    computeDetailStatistics(shot, shotMask, width, height),
  );
