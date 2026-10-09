import type { ParityRegion } from "#src/models/genshinParity/shared/ParityRegion";

import { fillRegionHarmonically } from "#src/services/genshinParity/reference/fillRegionHarmonically";
import { REFERENCES_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const DIGEST_LENGTH = 16;

// The reference drawn behind a screen, with its scored region filled from its surroundings: the game's interface is gone
// From the region, so a render that draws nothing scores the region's own error rather than the interface's, and every
// Piece drawn is scored against what is really there. It is cached beside the reference, keyed by the reference's hash
// And the region, so a changed reference or region is filled again. A region covering the whole frame has no border to
// Fill from, so it gets no plate and the caller keeps the reference as its backdrop
export const getCleanPlatePath = async (
  referenceId: string,
  referencePath: string,
  region: ParityRegion,
  { height, width }: { height: number; width: number },
): Promise<string | undefined> => {
  if (region.x === 0 && region.y === 0 && region.width >= width && region.height >= height) {
    console.log(`${referenceId} covers the whole frame, so it has no border to fill from and keeps the reference`);
    return undefined;
  }
  const digest = createHash("sha256")
    .update(await readFile(referencePath))
    .digest("hex")
    .slice(0, DIGEST_LENGTH);
  const platePath = join(
    REFERENCES_DIRECTORY,
    `${referenceId}.plate-${digest}-${region.x}-${region.y}-${region.width}-${region.height}.png`,
  );
  if (existsSync(platePath)) return platePath;
  const { data } = await sharp(referencePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const plate = fillRegionHarmonically(
    new Uint8Array(data.buffer, data.byteOffset, data.byteLength),
    width,
    height,
    region,
  );
  await sharp(plate, { raw: { channels: 4, height, width } })
    .png()
    .toFile(platePath);
  return platePath;
};
