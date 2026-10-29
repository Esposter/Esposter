import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";
import type { SharpInput } from "sharp";

import { fillRegionHarmonically } from "#src/services/recreation/image/fillRegionHarmonically";
import sharp from "sharp";

// A screenshot's pixels as RGBA, each region filled from the pixels round it in turn: the game's interface is gone from
// them, so a render that draws nothing scores their own error rather than the interface's
export const fillCleanPlate = async (
  input: SharpInput,
  regions: ImageRegion[],
  { height, width }: { height: number; width: number },
): Promise<Uint8Array> => {
  const { data } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return regions.reduce<Uint8Array>(
    (pixels, region) => fillRegionHarmonically(pixels, width, height, region),
    new Uint8Array(data.buffer, data.byteOffset, data.byteLength),
  );
};
