import { STRUCTURE_WIDTH } from "#src/services/genshinParity/shared/constants";
import sharp from "sharp";

// An image's pixels at the structure's size, three channels each
export const readPixels = (image: Buffer, height: number): Promise<Buffer> =>
  sharp(image).resize(STRUCTURE_WIDTH, height, { fit: "fill" }).removeAlpha().raw().toBuffer();
