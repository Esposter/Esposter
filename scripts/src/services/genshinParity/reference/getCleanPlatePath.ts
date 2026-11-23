import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

import { fillCleanPlate } from "#src/services/genshinParity/reference/fillCleanPlate";
import { getCleanPlateDigest } from "#src/services/genshinParity/reference/getCleanPlateDigest";
import { REFERENCE_SCRATCH_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { getFileSha256 } from "#src/services/provenance/getFileSha256";
import { writePartialThenMove } from "@esposter/shared-node/cache";
import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// The reference drawn behind a screen, each of its regions filled from the pixels round it in turn.
// A scratch copy is cut on first use, named by the input's hash and the regions, so a changed input is filled again.
// The caller decides whether the entry draws a plate.
// A clean plate is derived, so it is a cache in the scratch folder and never committed
export const getCleanPlatePath = async (
  referenceId: string,
  referencePath: string,
  regions: ImageRegion[],
  { height, width }: { height: number; width: number },
): Promise<string> => {
  const digest = getCleanPlateDigest(await getFileSha256(referencePath), regions);
  const platePath = join(REFERENCE_SCRATCH_DIRECTORY, `${referenceId}.plate-${digest}.png`);
  if (existsSync(platePath)) return platePath;
  const plate = await fillCleanPlate(referencePath, regions, { height, width });
  // Written whole and renamed onto its name, so a write cut short is never taken for a cached plate
  const png = await sharp(plate, { raw: { channels: 4, height, width } })
    .png()
    .toBuffer();
  await writePartialThenMove(platePath, (partialPath) => writeFile(partialPath, png));
  return platePath;
};
