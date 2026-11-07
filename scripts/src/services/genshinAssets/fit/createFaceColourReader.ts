import type { Texture } from "#src/models/genshinAssets/fit/Texture";
import type { Vector } from "#src/models/shared/Vector";

import { sampleSurfaceTexture } from "#src/services/genshinAssets/fit/sampleSurfaceTexture";
import { BYTE } from "#src/services/shared/constants";
import { Color, SRGBColorSpace } from "three";

// The colour at a point on a mesh's face, read from the texture its material draws with: the point's texel, found at its
// Own place on the face from the face's texture coordinates and the point's weights over its corners, taken to linear
// Light and multiplied by the material's tint, as the game's G-buffer holds it
export const createFaceColourReader = (
  { faceUvs, uvs }: { faceUvs: readonly Vector[]; uvs: readonly (readonly [number, number])[] },
  texture: Texture,
  [tintRed, tintGreen, tintBlue]: Readonly<Vector>,
): ((face: number, weights: Readonly<Vector>) => Vector) => {
  const colour = new Color();
  return (face, weights) => {
    const corners = (faceUvs[face] ?? [0, 0, 0]).map((uv) => uvs[uv] ?? [0, 0]);
    const [u, v] = [0, 1].map((axis) =>
      corners.reduce((sum, corner, index) => sum + (corner[axis] ?? 0) * (weights[index] ?? 0), 0),
    );
    const [red, green, blue] = sampleSurfaceTexture(texture, [u ?? 0, v ?? 0]).colour;
    colour.setRGB(red / BYTE, green / BYTE, blue / BYTE, SRGBColorSpace);
    return [colour.r * tintRed, colour.g * tintGreen, colour.b * tintBlue];
  };
};
