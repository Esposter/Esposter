const BASIS_SEPARATOR = ",";
// What an attempt was made against, in one shape: the hidden marker a comment carries (`getMarker`) and the trailer a
// Repair commits with (`getRepairTrailer`) both name their basis this way, so a count reads only the attempts the same
// Code made, and a repair's proof only a commit the same code asked for
export const getBasisText = (basisShas: string[]): string =>
  basisShas.length === 0 ? "" : ` against:${basisShas.join(BASIS_SEPARATOR)}`;
