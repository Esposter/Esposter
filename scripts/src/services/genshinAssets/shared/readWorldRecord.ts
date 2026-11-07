import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { readGameVersion } from "#src/services/genshinAssets/shared/readGameVersion";
import { readVouchedFileProvenance } from "#src/services/provenance/readVouchedFileProvenance";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// A fitted record of the world package's, read as text once its sidecar stamp names the install's game version
export const readWorldRecord = async (relativePath: string): Promise<string> => {
  const path = join(WORLD_DATA_DIRECTORY, relativePath);
  await readVouchedFileProvenance(path, await readGameVersion());
  return readFile(path, "utf8");
};
