import type { ParityReferenceManifestImage } from "#src/models/genshinParity/reference/ParityReferenceManifestImage";
import type { ParityReferenceManifestRow } from "#src/models/genshinParity/reference/ParityReferenceManifestRow";

// Every stored image a reference's row names: its main image, and its plate and clean plate when it has them
export const listReferenceImages = (row: ParityReferenceManifestRow): ParityReferenceManifestImage[] => [
  { bytes: row.bytes, height: row.height, sha256: row.sha256, width: row.width },
  ...(row.plate === undefined ? [] : [row.plate]),
  ...(row.cleanPlate === undefined ? [] : [row.cleanPlate]),
];
