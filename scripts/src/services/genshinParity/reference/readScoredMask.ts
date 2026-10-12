import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";
import type { ParitySilhouette } from "#src/models/genshinParity/shared/ParitySilhouette";
import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

import { computeScoredMask } from "#src/services/recreation/image/computeScoredMask";

// The pixels a comparison scores, on a raster of the given size over the region, 1 where the middle of the raster pixel
// Lies in one of the mask's rectangles or on the strokes of a glyph a silhouette holds, split from the reference's own
// Pixels by `readSilhouetteInks`, so a name's strokes count and the terrain between them, which the page does not draw,
// Never does. The whole region when the reference names neither
export const readScoredMask = (
  { mask, silhouettes = [] }: ParityReference,
  inks: { isInk: Uint8Array; silhouette: ParitySilhouette }[],
  region: ImageRegion,
  width: number,
  height: number,
): Uint8Array => {
  const rectangleMask = computeScoredMask(mask ?? (silhouettes.length > 0 ? [] : [region]), region, width, height);
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
