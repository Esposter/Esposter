import type { Texture } from "three";

import { createPmxTexture } from "genshin-engine";
import { NoColorSpace, SRGBColorSpace } from "three";

// A game model's texture from its file's bytes, read the way the export's own UVs address it. Those run from the bottom
// Left as Unity writes them, where the image's first row is the top, so the image is flipped to put its rows where the
// UVs read them. Only a colour texture decodes as sRGB, while a lightmap, a face map, a metal map and a ramp are data
// And are read as they are stored
export const createAvatarTexture = async (blob: Blob, isColour: boolean): Promise<Texture> => {
  const texture = await createPmxTexture(blob);
  texture.colorSpace = isColour ? SRGBColorSpace : NoColorSpace;
  texture.flipY = true;
  texture.needsUpdate = true;
  return texture;
};
