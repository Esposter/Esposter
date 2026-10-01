import type { SkyUniforms } from "#src/atmosphere/SkyUniforms";
import type { Texture } from "three";

import { getCloudAtlasColumns } from "#src/atmosphere/createCloudAtlasTexture";
import { InstancedBufferAttribute, Sprite } from "three";
import { instancedBufferAttribute, mix, texture, uv } from "three/tsl";
import { SpriteNodeMaterial } from "three/webgpu";

// A band of clouds as one sprite drawn once for all of them, each cloud a camera-facing billboard of its painted cloud
// In the atlas: shaded where its outline covers, lit where its crown does, in the sky's own cloud colours, and cut off
// Where it covers nothing, its foot at its place. Each is a draw of its own as a sprite apiece, and a band runs to
// Hundreds; drawn as one, they are blended in the order given, so they are laid out farthest from the origin first and
// The nearer edges blend over the farther. The fog pales them with distance as it pales the rest of the scene. Their
// Places are handed back, for a band that moves to rewrite and mark for upload
export const createCloudBandSprite = (
  atlas: Texture,
  clouds: readonly { position: [number, number, number]; spriteIndex: number; width: number }[],
  { aspect, spriteCount }: { aspect: number; spriteCount: number },
  { cloudLitColor, cloudShadeColor }: Pick<SkyUniforms, "cloudLitColor" | "cloudShadeColor">,
): { dispose: () => void; positions: InstancedBufferAttribute; sprite: Sprite } => {
  const columns = getCloudAtlasColumns(spriteCount);
  const ordered = clouds.toSorted(
    ({ position: [firstX, , firstZ] }, { position: [secondX, , secondZ] }) =>
      Math.hypot(secondX, secondZ) - Math.hypot(firstX, firstZ),
  );
  const positions = new InstancedBufferAttribute(new Float32Array(ordered.flatMap(({ position }) => position)), 3);
  // A cloud's cell is `aspect` times as wide as it is tall
  const scales = new InstancedBufferAttribute(
    new Float32Array(ordered.flatMap(({ width }) => [width, width / aspect])),
    2,
  );
  // The texture's rows run down from its top while uv runs up, so each cell's row is counted from the bottom
  const cells = new InstancedBufferAttribute(
    new Float32Array(
      ordered.flatMap(({ spriteIndex }) => [spriteIndex % columns, columns - 1 - Math.floor(spriteIndex / columns)]),
    ),
    2,
  );
  const mask = texture(atlas, uv().add(instancedBufferAttribute(cells)).div(columns));
  const material = new SpriteNodeMaterial({ depthWrite: false, transparent: true });
  material.positionNode = instancedBufferAttribute(positions);
  material.scaleNode = instancedBufferAttribute(scales);
  material.colorNode = mix(cloudShadeColor, cloudLitColor, mask.g);
  material.opacityNode = mask.r;
  material.alphaTest = 0.5;
  const sprite = new Sprite(material);
  sprite.center.set(0.5, 0);
  sprite.count = ordered.length;
  // The sprite stands at the origin while its clouds stand anywhere about it, so it is never culled as one point
  sprite.frustumCulled = false;
  return {
    dispose: () => {
      material.dispose();
    },
    positions,
    sprite,
  };
};
