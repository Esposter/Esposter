import { measureFrameSoftness } from "#src/services/genshinParity/reference/measureFrameSoftness";
import { writeFile } from "node:fs/promises";

// Measures a capture's frame into its cache file, so the next run reads it instead
export const measureCapture = async (framePath: string, cachePath: string): Promise<number> => {
  const softness = await measureFrameSoftness(framePath);
  await writeFile(cachePath, String(softness));
  return softness;
};
