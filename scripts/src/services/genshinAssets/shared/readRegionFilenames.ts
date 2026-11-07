import { PROVENANCE_SIDECAR_SUFFIX } from "#src/services/provenance/constants";
import { readdir } from "node:fs/promises";

// The filenames of the region files in a regions folder, with each provenance sidecar left out: a region file's stamp sits
// Beside it in the same folder, and it is no region
export const readRegionFilenames = async (regionsDirectory: string): Promise<string[]> =>
  (await readdir(regionsDirectory)).filter((filename) => !filename.endsWith(PROVENANCE_SIDECAR_SUFFIX));
