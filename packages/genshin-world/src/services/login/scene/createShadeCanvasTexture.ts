import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter, NoColorSpace } from "three";

// The most a texture is sampled along a grazing line of sight, which the walkway's far paving and the towers' far
// Faces are seen along
const MAX_ANISOTROPY = 8;
// A canvas drawn once as the texture a part reads its shade from: values rather than colours, so no colour space
// Converts them, and filtered through its mipmaps so it holds still as the part glides off into the distance
export const createShadeCanvasTexture = (canvas: OffscreenCanvas): CanvasTexture<OffscreenCanvas> => {
  const shadeCanvasTexture = new CanvasTexture(canvas);
  shadeCanvasTexture.colorSpace = NoColorSpace;
  shadeCanvasTexture.magFilter = LinearFilter;
  shadeCanvasTexture.minFilter = LinearMipmapLinearFilter;
  shadeCanvasTexture.anisotropy = MAX_ANISOTROPY;
  return shadeCanvasTexture;
};
