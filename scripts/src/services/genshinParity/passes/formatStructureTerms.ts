import type { StructureTerm } from "#src/services/genshinParity/passes/computeStructureTerms";

// A family's structure terms as the surface pass's note prints them, variance then bands finest first: the exports' and
// Ours to three significant figures, since a band's energy is a few thousandths and reads as zero at four places, and
// The error to three places
export const formatStructureTerms = (terms: readonly StructureTerm[]): string =>
  terms
    .map(({ error, reference, shot }) => `${reference.toPrecision(3)} | ${shot.toPrecision(3)} | ${error.toFixed(3)}`)
    .join(", ");
