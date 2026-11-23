import { PROVENANCE_SIDECAR_SUFFIX } from "#src/services/provenance/constants";
import { REGION_LANDMARKS_SUFFIX } from "genshin-world";
import { readdir } from "node:fs/promises";

// The filenames of the region files in a regions folder, with each provenance sidecar and each landmarks file left out:
// A Region file's stamp sits beside it in the same folder, and its landmarks file is a part of the region, so neither
// Is a region
export const readRegionFilenames = async (regionsDirectory: string): Promise<string[]> =>
  (await readdir(regionsDirectory)).filter(
    (filename) => !filename.endsWith(PROVENANCE_SIDECAR_SUFFIX) && !filename.endsWith(REGION_LANDMARKS_SUFFIX),
  );
