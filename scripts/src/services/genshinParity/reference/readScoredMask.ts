import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";
import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

import { splitGlyph } from "#src/services/genshinParity/shared/splitGlyph";
import { computeScoredMask } from "#src/services/recreation/image/computeScoredMask";
import sharp from "sharp";

// The pixels a comparison scores, on a raster of the given size over the region, 1 where the middle of the raster pixel
// Lies in one of the mask's rectangles or on the strokes of a glyph a silhouette holds, split from the reference's own
// Pixels, so a name's strokes count and the terrain between them, which the page does not draw, never does. The whole
// Region when the reference names neither
export const readScoredMask = async (
  referencePath: string,
  { mask, silhouettes = [] }: ParityReference,
  region: ImageRegion,
  width: number,
  height: number,
): Promise<Uint8Array> => {
  const rectangleMask = computeScoredMask(mask ?? (silhouettes.length > 0 ? [] : [region]), region, width, height);
  const inks = await Promise.all(
    silhouettes.map(async (silhouette) => {
      const { data, info } = await sharp(referencePath)
        .removeAlpha()
        .extract({ height: silhouette.height, left: silhouette.x, top: silhouette.y, width: silhouette.width })
        .raw()
        .toBuffer({ resolveWithObject: true });
      return { isInk: splitGlyph(data, info.channels, info.width, info.height, silhouette.ink), silhouette };
    }),
  );
  return rectangleMask.map((isScored, index) => {
    if (isScored) return 1;
    const x = region.x + (((index % width) + 0.5) / width) * region.width;
    const y = region.y + ((Math.floor(index / width) + 0.5) / height) * region.height;
    return Number(
      inks.some(({ isInk, silhouette }) => {
        const column = Math.floor(x - silhouette.x);
        const row = Math.floor(y - silhouette.y);
        return (
          column >= 0 &&
          column < silhouette.width &&
          row >= 0 &&
          row < silhouette.height &&
          isInk[row * silhouette.width + column] === 1
        );
      }),
    );
  });
};
