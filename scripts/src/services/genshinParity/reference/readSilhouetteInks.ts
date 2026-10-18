import type { SilhouetteInk } from "#src/models/genshinParity/reference/SilhouetteInk";
import type { ParitySilhouette } from "#src/models/genshinParity/shared/ParitySilhouette";
import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

import { computeGroundColour } from "#src/services/genshinParity/shared/computeGroundColour";
import { splitGlyph } from "#src/services/genshinParity/shared/splitGlyph";
import sharp from "sharp";

// Each silhouette's strokes split from the reference's own pixels, 1 for ink, on the silhouette's own raster, so a
// Glyph's ink is read once however many rasters it is scored on. The ground is read once, from the region's pixels
// Outside every silhouette
export const readSilhouetteInks = async (
  referencePath: string,
  region: ImageRegion,
  silhouettes: readonly ParitySilhouette[],
): Promise<SilhouetteInk[]> => {
  if (silhouettes.length === 0) return [];
  const { data: regionData, info: regionInfo } = await sharp(referencePath)
    .removeAlpha()
    .extract({ height: region.height, left: region.x, top: region.y, width: region.width })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const ground = computeGroundColour(
    regionData,
    regionInfo.channels,
    regionInfo.width,
    regionInfo.height,
    silhouettes.map((silhouette) => ({
      height: silhouette.height,
      width: silhouette.width,
      x: silhouette.x - region.x,
      y: silhouette.y - region.y,
    })),
  );
  return Promise.all(
    silhouettes.map(async (silhouette) => {
      const { data, info } = await sharp(referencePath)
        .removeAlpha()
        .extract({ height: silhouette.height, left: silhouette.x, top: silhouette.y, width: silhouette.width })
        .raw()
        .toBuffer({ resolveWithObject: true });
      return { isInk: splitGlyph(data, info.channels, info.width, info.height, silhouette.ink, ground), silhouette };
    }),
  );
};
