import { MAX_BYTE } from "#src/constants";

// Whether any texel of a texture is less than fully opaque. A material whose texture has such texels is blended, as a
// Material whose diffuse alpha is below one is, since its clear texels would otherwise be drawn as opaque black holes
export const checkTransparentTexels = (image: ImageBitmap): boolean => {
  const context = new OffscreenCanvas(image.width, image.height).getContext("2d", { willReadFrequently: true });
  if (!context) return false;
  context.drawImage(image, 0, 0);
  const { data } = context.getImageData(0, 0, image.width, image.height);
  for (let alphaIndex = 3; alphaIndex < data.length; alphaIndex += 4) {
    const alpha = data[alphaIndex];
    if (alpha !== undefined && alpha < MAX_BYTE) return true;
  }
  return false;
};
