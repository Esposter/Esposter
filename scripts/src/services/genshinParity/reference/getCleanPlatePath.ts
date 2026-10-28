import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

import { DIGEST_LENGTH } from "#src/services/genshinParity/reference/constants";
import { REFERENCES_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { fillRegionHarmonically } from "#src/services/recreation/image/fillRegionHarmonically";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, rename } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// The reference drawn behind a screen, with each of its regions filled from its surroundings in turn: the game's
// Interface is gone from them, so a render that draws nothing scores their own error rather than the interface's, and
// Every piece drawn is scored against what is really there. It is cached beside the reference, keyed by the reference's
// Hash and the regions, so a changed reference or region is filled again. A region covering the whole frame has no
// Border to fill from, so it gets no plate and the caller keeps its source image as its backdrop
export const getCleanPlatePath = async (
  referenceId: string,
  referencePath: string,
  regions: ImageRegion[],
  { height, width }: { height: number; width: number },
): Promise<string | undefined> => {
  if (regions.some((region) => region.x === 0 && region.y === 0 && region.width >= width && region.height >= height)) {
    console.log(`${referenceId} covers the whole frame, so it has no border to fill from and keeps its source`);
    return undefined;
  }
  const digest = createHash("sha256")
    .update(await readFile(referencePath))
    .update(JSON.stringify(regions))
    .digest("hex")
    .slice(0, DIGEST_LENGTH);
  const platePath = join(REFERENCES_DIRECTORY, `${referenceId}.plate-${digest}.png`);
  if (existsSync(platePath)) return platePath;
  const { data } = await sharp(referencePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const plate = regions.reduce<Uint8Array>(
    (pixels, region) => fillRegionHarmonically(pixels, width, height, region),
    new Uint8Array(data.buffer, data.byteOffset, data.byteLength),
  );
  // Written beside its name and renamed onto it, so a write cut short is never taken for a cached plate
  const partialPath = `${platePath}.partial`;
  await sharp(plate, { raw: { channels: 4, height, width } })
    .png()
    .toFile(partialPath);
  await rename(partialPath, platePath);
  return platePath;
};
