import type { ParityReferenceManifest } from "#src/models/genshinParity/reference/ParityReferenceManifest";

import { formatManifestFile } from "#src/services/genshinParity/reference/formatManifestFile";
import { REFERENCE_MANIFEST_PATH } from "#src/services/genshinParity/shared/constants";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

// Writes the manifest, creating its folder when the first thing is packed
export const writeManifestFile = async (manifest: ParityReferenceManifest): Promise<void> => {
  await mkdir(dirname(REFERENCE_MANIFEST_PATH), { recursive: true });
  await writeFile(REFERENCE_MANIFEST_PATH, formatManifestFile(manifest));
};
