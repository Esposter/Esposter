import type { SkyUniforms } from "#src/atmosphere/SkyUniforms";
import type { Texture } from "three";

import { getCloudAtlasColumns } from "#src/atmosphere/createCloudAtlasTexture";
import { mix, texture, uv, vec2 } from "three/tsl";
import { SpriteNodeMaterial } from "three/webgpu";

// One cloud sprite of the atlas as a camera-facing billboard: shaded where its outline covers, lit where its crown
// Does, in the sky's own cloud colours, and cut off where it covers nothing. The fog pales it with distance as it
// Pales the rest of the scene
export const createCloudSpriteMaterial = (
  atlas: Texture,
  { index, spriteCount }: { index: number; spriteCount: number },
  { cloudLitColor, cloudShadeColor }: Pick<SkyUniforms, "cloudLitColor" | "cloudShadeColor">,
): SpriteNodeMaterial => {
  const columns = getCloudAtlasColumns(spriteCount);
  const column = index % columns;
  const row = Math.floor(index / columns);
  // The texture's rows run down from its top while uv runs up, so the cell's row is counted from the bottom
  const cellUv = uv()
    .add(vec2(column, columns - 1 - row))
    .div(columns);
  const mask = texture(atlas, cellUv);
  const material = new SpriteNodeMaterial({ depthWrite: false, transparent: true });
  material.colorNode = mix(cloudShadeColor, cloudLitColor, mask.g);
  material.opacityNode = mask.r;
  material.alphaTest = 0.5;
  return material;
};
