import { hashFile } from "#src/services/genshinParity/reference/hashFile";
import { measureFrameSoftness } from "#src/services/genshinParity/reference/measureFrameSoftness";
import { REFERENCES_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { existsSync } from "node:fs";
import { readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";

// The Gaussian sigma of a screenshot's own blur, cached beside it under the file's hash, so a changed screenshot is
// Measured again. Only a reference sampled from a recording asks for it: a still shot in the game is never softened
export const getReferenceSoftness = async (referenceId: string): Promise<number> => {
  const referencePath = join(REFERENCES_DIRECTORY, `${referenceId}.png`);
  const cachePath = join(REFERENCES_DIRECTORY, `${referenceId}.softness-${await hashFile(referencePath)}.txt`);
  const cachedText = existsSync(cachePath) ? await readFile(cachePath, "utf8") : "";
  // A cache file left empty or unreadable by a run that stopped mid-write is measured again, and the measure rewrites it
  const cachedSoftness = cachedText ? Number(cachedText) : Number.NaN;
  if (!Number.isNaN(cachedSoftness)) return cachedSoftness;
  const softness = await measureFrameSoftness(referencePath);
  // Written beside its name and renamed onto it, so a write cut short is never read back as a smaller sigma
  const partialPath = `${cachePath}.partial`;
  await writeFile(partialPath, String(softness));
  await rename(partialPath, cachePath);
  return softness;
};
