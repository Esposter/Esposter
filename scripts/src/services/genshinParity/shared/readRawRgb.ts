import sharp from "sharp";

// An image's pixels at the width and height given, as red, green and blue bytes a pixel at a time, its alpha dropped
export const readRawRgb = async (input: Buffer, width: number, height: number): Promise<Buffer> =>
  sharp(input).resize(width, height, { fit: "fill" }).removeAlpha().raw().toBuffer();
