import { NearestFilter, NoColorSpace, RepeatWrapping, SRGBColorSpace, Texture } from "three";

// A PMX model's texture from its file's bytes, decoded as they are stored: unpremultiplied and unconverted, since the
// Blend and the colour space are three's to apply, and unflipped, since the model's texture coordinates run from the
// Image's top left corner where three's run from its bottom left. Past its edges it repeats, as MMD samples it
export const createPmxTexture = async (blob: Blob): Promise<Texture> => {
  const image = await createImageBitmap(blob, { colorSpaceConversion: "none", premultiplyAlpha: "none" });
  const texture = new Texture(image);
  texture.colorSpace = SRGBColorSpace;
  texture.flipY = false;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
};

// A PMX model's toon ramp from its file's bytes. A ramp is a lookup of how much light a texel takes rather than a colour,
// So it is read as it is stored, not decoded from sRGB, and sampled nearest so each step of shade stays a step. Three
// Looks a gradient up along its bottom row, so the ramp is flipped to put its first row there
export const createPmxToonTexture = async (blob: Blob): Promise<Texture> => {
  const texture = await createPmxTexture(blob);
  texture.colorSpace = NoColorSpace;
  texture.flipY = true;
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  texture.needsUpdate = true;
  return texture;
};
