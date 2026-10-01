import type { SkyUniforms } from "#src/atmosphere/SkyUniforms";
import type { Texture } from "three";

import { getCloudAtlasColumns } from "#src/atmosphere/createCloudAtlasTexture";
import { orderByViewDepth } from "#src/atmosphere/orderByViewDepth";
import { InstancedBufferAttribute, Matrix4, Sprite } from "three";
import { instancedBufferAttribute, mix, texture, uv } from "three/tsl";
import { SpriteNodeMaterial } from "three/webgpu";

// A band of clouds as one sprite drawn once for all of them, each cloud a camera-facing billboard of its painted cloud
// In the atlas: shaded where its outline covers, lit where its crown does, in the sky's own cloud colours, and cut off
// Where it covers nothing, its foot at its place. Each is a draw of its own as a sprite apiece, and a band runs to
// Hundreds; drawn as one, they are blended in the order given, which three's own sort of the objects no longer sets, so
// Before each draw they are laid out farthest along the camera's view first, as that sort would, and the nearer edges
// Blend over the farther. The fog pales them with distance as it pales the rest of the scene. Their places are handed
// Back in the order given, for a band that moves to rewrite in place
export const createCloudBandSprite = (
  atlas: Texture,
  clouds: readonly { position: [number, number, number]; spriteIndex: number; width: number }[],
  { aspect, spriteCount }: { aspect: number; spriteCount: number },
  { cloudLitColor, cloudShadeColor }: Pick<SkyUniforms, "cloudLitColor" | "cloudShadeColor">,
): { dispose: () => void; places: [number, number, number][]; sprite: Sprite } => {
  const columns = getCloudAtlasColumns(spriteCount);
  const places = clouds.map(({ position }): [number, number, number] => [...position]);
  // A cloud's cell is `aspect` times as wide as it is tall
  const cloudScales = clouds.map(({ width }) => [width, width / aspect]);
  // The texture's rows run down from its top while uv runs up, so each cell's row is counted from the bottom
  const cloudCells = clouds.map(({ spriteIndex }) => [
    spriteIndex % columns,
    columns - 1 - Math.floor(spriteIndex / columns),
  ]);
  const positions = new InstancedBufferAttribute(new Float32Array(clouds.length * 3), 3);
  const scales = new InstancedBufferAttribute(new Float32Array(clouds.length * 2), 2);
  const cells = new InstancedBufferAttribute(new Float32Array(clouds.length * 2), 2);
  const mask = texture(atlas, uv().add(instancedBufferAttribute(cells)).div(columns));
  const material = new SpriteNodeMaterial({ depthWrite: false, transparent: true });
  material.positionNode = instancedBufferAttribute(positions);
  material.scaleNode = instancedBufferAttribute(scales);
  material.colorNode = mix(cloudShadeColor, cloudLitColor, mask.g);
  material.opacityNode = mask.r;
  material.alphaTest = 0.5;
  const sprite = new Sprite(material);
  sprite.center.set(0.5, 0);
  sprite.count = clouds.length;
  // The sprite stands at the origin while its clouds stand anywhere about it, so it is never culled as one point
  sprite.frustumCulled = false;
  const modelViewMatrix = new Matrix4();
  sprite.onBeforeRender = (_renderer, _scene, camera) => {
    modelViewMatrix.multiplyMatrices(camera.matrixWorldInverse, sprite.matrixWorld);
    for (const [instance, cloud] of orderByViewDepth(places, modelViewMatrix).entries()) {
      positions.set(places[cloud] ?? [], instance * 3);
      scales.set(cloudScales[cloud] ?? [], instance * 2);
      cells.set(cloudCells[cloud] ?? [], instance * 2);
    }
    positions.needsUpdate = true;
    scales.needsUpdate = true;
    cells.needsUpdate = true;
  };
  return {
    dispose: () => {
      material.dispose();
    },
    places,
    sprite,
  };
};
