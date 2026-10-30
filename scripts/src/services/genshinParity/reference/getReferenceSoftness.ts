import { getSoftnessFileName } from "#src/services/genshinParity/reference/getSoftnessFileName";
import { hashFile } from "#src/services/genshinParity/reference/hashFile";
import { measureFrameSoftness } from "#src/services/genshinParity/reference/measureFrameSoftness";
import { REFERENCE_SCRATCH_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { getReferencePath } from "#src/services/genshinParity/shared/getReferencePath";
import { writePartialThenMove } from "#src/services/shared/writePartialThenMove";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The Gaussian sigma of a recording's own blur is measured from the reference's bytes.
// It is cached in the scratch folder by their hash.
// It is not published: it measures the image the manifest already holds, so a new machine measures it once.
// Only a reference sampled from a recording asks for it, since a still shot in the game is never softened.
export const getReferenceSoftness = async (referenceId: string): Promise<number> => {
  const referencePath = await getReferencePath(referenceId);
  const cachePath = join(REFERENCE_SCRATCH_DIRECTORY, getSoftnessFileName(referenceId, await hashFile(referencePath)));
  const cachedText = existsSync(cachePath) ? await readFile(cachePath, "utf8") : "";
  // A cache left empty by a run that stopped mid-write is measured again, and the measure rewrites it
  const cachedSoftness = cachedText ? Number(cachedText) : Number.NaN;
  if (!Number.isNaN(cachedSoftness)) return cachedSoftness;
  const softness = await measureFrameSoftness(await readFile(referencePath));
  // Written whole and renamed onto its name, so a write cut short is never read back as a smaller sigma
  await writePartialThenMove(cachePath, String(softness));
  return softness;
};
