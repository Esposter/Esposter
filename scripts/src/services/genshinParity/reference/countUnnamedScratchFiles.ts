import { PLATE_CACHE_REGEX } from "#src/services/genshinParity/reference/constants";
import { REFERENCE_SCRATCH_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { existsSync } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

// The scratch screenshots of the named entries that a pack did not read, left where they are, with their total size
export const countUnnamedScratchFiles = async (ids: string[]): Promise<{ bytes: number; count: number }> => {
  if (!existsSync(REFERENCE_SCRATCH_DIRECTORY)) return { bytes: 0, count: 0 };
  const named = new Set(ids.flatMap((id) => [`${id}.png`, `${id}.plate.png`]));
  // A clean plate cached in the scratch folder is derived and recomputed on demand, so it is not an unnamed screenshot
  const names = (await readdir(REFERENCE_SCRATCH_DIRECTORY)).filter(
    (name) => name.endsWith(".png") && !named.has(name) && !PLATE_CACHE_REGEX.test(name),
  );
  const sizes = await Promise.all(
    names.map(async (name) => (await stat(join(REFERENCE_SCRATCH_DIRECTORY, name))).size),
  );
  return { bytes: sizes.reduce((total, size) => total + size, 0), count: names.length };
};
