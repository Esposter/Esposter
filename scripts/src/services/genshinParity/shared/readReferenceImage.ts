import sharp from "sharp";

// A reference's image at the width and height given, as a PNG with its alpha dropped. A WebP reference is shrunk as it
// Loads by default, which resamples its pixels differently from its PNG, so the shrink is left to the resize, and the
// Reference reads as the screenshot it was packed from
export const readReferenceImage = (referencePath: string, width: number, height: number): Promise<Buffer> =>
  sharp(referencePath).resize(width, height, { fastShrinkOnLoad: false }).removeAlpha().png().toBuffer();
