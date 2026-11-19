import type { StructureTerm } from "#src/services/genshinParity/passes/computeStructureTerms";

import { computeStructureError } from "#src/services/genshinParity/passes/computeStructureError";
import { computeStructureTerms } from "#src/services/genshinParity/passes/computeStructureTerms";

// A family's structure of ours against the exports', over the pixels its mask holds: each lightness reduced to the
// Statistics `statisticsOf` reads (the luminance's variance, then each octave band's energy), their root mean square of
// Relative errors (`computeStructureError`) and each statistic's own term (`computeStructureTerms`). The surface pass
// Gates the first and the grain fit solves the second, so both read it through this one definition
export const computeFamilyStructure = async (
  statisticsOf: (values: Float32Array, mask: Uint8Array) => Promise<number[]>,
  exportsLightness: Float32Array,
  oursLightness: Float32Array,
  mask: Uint8Array,
): Promise<{ structure: number; terms: StructureTerm[] }> => {
  const [reference, shot] = await Promise.all([
    statisticsOf(exportsLightness, mask),
    statisticsOf(oursLightness, mask),
  ]);
  return { structure: computeStructureError(reference, shot), terms: computeStructureTerms(reference, shot) };
};
