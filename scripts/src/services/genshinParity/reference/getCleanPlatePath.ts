import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

import { fillCleanPlate } from "#src/services/genshinParity/reference/fillCleanPlate";
import { getCleanPlateDigest } from "#src/services/genshinParity/reference/getCleanPlateDigest";
import { sha256File } from "#src/services/genshinParity/reference/sha256File";
import { REFERENCE_SCRATCH_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { writePartialThenMove } from "#src/services/shared/writePartialThenMove";
import { existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

// The reference drawn behind a screen, each of its regions filled from the pixels round it in turn. A scratch copy is cut
// on first use, named by the input's hash and the regions so a changed input is filled again. The caller decides whether
// the entry draws a plate. A clean plate is derived, so it is a cache in the scratch folder and never committed
export const getCleanPlatePath = async (
  referenceId: string,
  referencePath: string,
  regions: ImageRegion[],
  { height, width }: { height: number; width: number },
): Promise<string> => {
  const digest = getCleanPlateDigest(await sha256File(referencePath), regions);
  const platePath = join(REFERENCE_SCRATCH_DIRECTORY, `${referenceId}.plate-${digest}.png`);
  if (existsSync(platePath)) return platePath;
  const plate = await fillCleanPlate(referencePath, regions, { height, width });
  // Written whole and renamed onto its name, so a write cut short is never taken for a cached plate
  const png = await sharp(plate, { raw: { channels: 4, height, width } })
    .png()
    .toBuffer();
  await writePartialThenMove(platePath, png);
  return platePath;
};
