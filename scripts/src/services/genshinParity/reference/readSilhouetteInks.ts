import type { SilhouetteInk } from "#src/models/genshinParity/reference/SilhouetteInk";
import type { ParitySilhouette } from "#src/models/genshinParity/shared/ParitySilhouette";

import { splitGlyph } from "#src/services/genshinParity/shared/splitGlyph";
import sharp from "sharp";

// Each silhouette's strokes split from the reference's own pixels, 1 for ink, on the silhouette's own raster, so a
// Glyph's ink is read once however many rasters it is scored on
export const readSilhouetteInks = (
  referencePath: string,
  silhouettes: readonly ParitySilhouette[],
): Promise<SilhouetteInk[]> =>
  Promise.all(
    silhouettes.map(async (silhouette) => {
      const { data, info } = await sharp(referencePath)
        .removeAlpha()
        .extract({ height: silhouette.height, left: silhouette.x, top: silhouette.y, width: silhouette.width })
        .raw()
        .toBuffer({ resolveWithObject: true });
      return { isInk: splitGlyph(data, info.channels, info.width, info.height, silhouette.ink), silhouette };
    }),
  );
