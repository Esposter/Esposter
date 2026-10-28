import { SCENE_TEXTURE_ANISOTROPY } from "#src/services/scene/constants";
import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter, NoColorSpace } from "three";

// A canvas drawn once as the texture a part reads its shade from: values rather than colours, so no colour space
// Converts them, and filtered through its mipmaps so it holds still as the part glides off into the distance
export const createShadeCanvasTexture = (canvas: OffscreenCanvas): CanvasTexture<OffscreenCanvas> => {
  const shadeCanvasTexture = new CanvasTexture(canvas);
  shadeCanvasTexture.colorSpace = NoColorSpace;
  shadeCanvasTexture.magFilter = LinearFilter;
  shadeCanvasTexture.minFilter = LinearMipmapLinearFilter;
  shadeCanvasTexture.anisotropy = SCENE_TEXTURE_ANISOTROPY;
  return shadeCanvasTexture;
};
