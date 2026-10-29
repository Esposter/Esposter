import type { RectangleSide } from "#src/models/genshinParity/probe/RectangleSide";
import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";
import type { Sharp } from "sharp";

import { computeRectangleSide } from "#src/services/genshinParity/probe/computeRectangleSide";

// A rectangle of an image read from its pixels, the image already sized to the reference's so the rectangle is in its pixels
export const readRectangleSide = async (image: Sharp, rect: ImageRegion): Promise<RectangleSide> => {
  const { data, info } = await image
    .extract({ height: rect.height, left: rect.x, top: rect.y, width: rect.width })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return computeRectangleSide(data, info.width, info.height);
};
