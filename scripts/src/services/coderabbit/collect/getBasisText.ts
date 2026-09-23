const BASIS_SEPARATOR = ",";
// What an attempt was made against, in the one shape every count reads: the hidden marker a comment carries
// (`getMarker`) and the trailer a repair commits with (`getRepairTrailer`) both name their basis this way, so a
// Count reads only the attempts the same code made wherever the attempt was recorded
export const getBasisText = (basisShas: string[]): string =>
  basisShas.length === 0 ? "" : ` against:${basisShas.join(BASIS_SEPARATOR)}`;
