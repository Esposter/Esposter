import type { ParityReferenceManifest } from "#src/models/genshinParity/reference/ParityReferenceManifest";

import { parseReferenceManifest } from "#src/services/genshinParity/reference/parseReferenceManifest";
import { REFERENCE_MANIFEST_PATH } from "#src/services/genshinParity/shared/constants";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

// The committed manifest, with an empty one when no reference, recording or record has been packed yet
export const readManifestFile = async (): Promise<ParityReferenceManifest> =>
  parseReferenceManifest(
    existsSync(REFERENCE_MANIFEST_PATH) ? await readFile(REFERENCE_MANIFEST_PATH, "utf8") : undefined,
  );
