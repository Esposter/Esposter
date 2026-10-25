import { BYTE } from "#src/services/shared/constants";
import sharp from "sharp";

export const readRgb = async (input: Buffer, width: number, height: number): Promise<Float32Array> => {
  const { data } = await sharp(input)
    .resize(width, height, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return Float32Array.from(data, (value) => value / BYTE);
};
