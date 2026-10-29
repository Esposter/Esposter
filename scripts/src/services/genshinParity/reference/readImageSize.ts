import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

import sharp from "sharp";

// An image's width and height, read from its header alone
export const readImageSize = async (path: string): Promise<Pick<ImageRegion, "height" | "width">> => {
  const { height, width } = await sharp(path).metadata();
  return { height, width };
};
