import type { ParityReferenceManifestRow } from "#src/models/genshinParity/reference/ParityReferenceManifestRow";

import { readManifestFile } from "#src/services/genshinParity/reference/readManifestFile";

// The reference rows of the committed manifest, one per reference id
export const readReferenceManifest = async (): Promise<ParityReferenceManifestRow[]> =>
  (await readManifestFile()).references;
