import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

import { fillCleanPlate } from "#src/services/genshinParity/reference/fillCleanPlate";
import { getCleanPlateDigest } from "#src/services/genshinParity/reference/getCleanPlateDigest";
import { readCachedReference } from "#src/services/genshinParity/reference/readCachedReference";
import { readReferenceManifest } from "#src/services/genshinParity/reference/readReferenceManifest";
import { sha256File } from "#src/services/genshinParity/reference/sha256File";
import { REFERENCE_SCRATCH_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { existsSync } from "node:fs";
import { rename } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// The reference drawn behind a screen, each of its regions filled from the pixels round it in turn. The stored plate is
// used when the manifest holds one filled from this input and these regions, else a scratch copy is cut, named by the
// input's hash and the regions so a changed input is filled again. The caller decides whether the entry draws a plate
export const getCleanPlatePath = async (
  referenceId: string,
  referencePath: string,
  regions: ImageRegion[],
  { height, width }: { height: number; width: number },
): Promise<string> => {
  const digest = getCleanPlateDigest(await sha256File(referencePath), regions);
  const row = (await readReferenceManifest()).find(({ id }) => id === referenceId);
  if (row?.cleanPlate?.digest === digest) return readCachedReference(row.cleanPlate.sha256);
  const platePath = join(REFERENCE_SCRATCH_DIRECTORY, `${referenceId}.plate-${digest}.png`);
  if (existsSync(platePath)) return platePath;
  const plate = await fillCleanPlate(referencePath, regions, { height, width });
  // Written beside its name and renamed onto it, so a write cut short is never taken for a cached plate
  const partialPath = `${platePath}.partial`;
  await sharp(plate, { raw: { channels: 4, height, width } })
    .png()
    .toFile(partialPath);
  await rename(partialPath, platePath);
  return platePath;
};
