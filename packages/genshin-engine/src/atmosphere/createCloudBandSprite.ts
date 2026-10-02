import type { SkyUniforms } from "#src/atmosphere/SkyUniforms";
import type { Texture } from "three";
import type { UniformNode } from "three/webgpu";

import { getCloudAtlasColumns } from "#src/atmosphere/createCloudAtlasTexture";
import { orderByViewDepth } from "#src/atmosphere/orderByViewDepth";
import { InstancedBufferAttribute, Matrix4, Sprite } from "three";
import {
  asin,
  cameraPosition,
  clamp,
  float,
  instancedBufferAttribute,
  max,
  mix,
  pow,
  saturate,
  smoothstep,
  step,
  texture,
  uniform,
  uv,
} from "three/tsl";
import { SpriteNodeMaterial } from "three/webgpu";

// Where a cloud fades out below the horizon, from a tenth of a right angle under it to none a fifth further down
const BELOW_FADE_START = 0.1;
const BELOW_FADE_SCALE = 5;
// How much of its lit colour a cloud gains with the sky's coverage
const COVERAGE_LIGHT_SHARE = 0.4;
// The painted edge's fade, from none at the first coverage to whole at the second, and the coverage under which a
// Fragment is dropped rather than blended as nothing
const EDGE_FADE_START = 0;
const EDGE_FADE_END = 1;
const DROPPED_COVERAGE = 0.01;
// The least cover a cloud's crown is read as a share of, so the outermost fade reads none of it
const MIN_CROWN_COVER = 0.05;
// A band of clouds as one sprite drawn once for all of them, each cloud a camera-facing billboard of its painted cloud
// In the atlas, cut off where it covers nothing, its foot at its place. Each is a draw of its own as a sprite apiece,
// And a band runs to hundreds; drawn as one, they are blended in the order given, which three's own sort of the
// Objects no longer sets, so before each draw they are laid out farthest along the camera's view first, as that sort
// Would, and the nearer edges blend over the farther. Each is coloured as the game's cloud particles are
// (Login/Scene/Index.reference.ts, source `cloudParticleShader`): its shaded colour mixed toward its lit one where its
// Painted crown is, each blended from away from the sun to toward it by how far toward the sun the cloud stands,
// Gaining light with the sky's coverage and brightening toward the sun, fading out at its soft painted edge and below
// The horizon. The game also gives a low cloud way to the sky's colour behind it unless the sky is thickly covered, by
// A coverage its environment sets at run time; ours stands in for its cloud layer's alone, so that waits on the game's
// Own. Their places are handed back in the order given, for a band that moves to rewrite in place, and the band's cover,
// The share of its clouds drawn: each cloud is ranked by its place in the order given, which a band scatters at random,
// So a sky with less cover draws the first of them and leaves the rest, spread as evenly, undrawn
export const createCloudBandSprite = (
  atlas: Texture,
  clouds: readonly { position: [number, number, number]; spriteIndex: number; width: number }[],
  { aspect, spriteCount }: { aspect: number; spriteCount: number },
  skyUniforms: SkyUniforms,
): { cover: UniformNode<"float", number>; dispose: () => void; places: [number, number, number][]; sprite: Sprite } => {
  const {
    cloudCoverage,
    cloudFrontBackBlend,
    cloudLitBackColor,
    cloudLitColor,
    cloudShadeBackColor,
    cloudShadeColor,
    cloudSunBrighten,
    sunDirection,
  } = skyUniforms;
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
  const ranks = new InstancedBufferAttribute(new Float32Array(clouds.length), 1);
  const cover = uniform(1);
  const mask = texture(atlas, uv().add(instancedBufferAttribute(cells)).div(columns));
  const place = instancedBufferAttribute<"vec3">(positions);
  const direction = place.sub(cameraPosition).normalize();
  const elevation = asin(clamp(direction.y, -1, 1)).mul(2 / Math.PI);
  const sunCosine = direction.dot(sunDirection);
  const toward = pow(max(sunCosine.mul(cloudFrontBackBlend).add(float(1).sub(cloudFrontBackBlend)), 0), 3);
  const lit = mix(cloudLitBackColor, cloudLitColor, toward);
  const shade = mix(cloudShadeBackColor, cloudShadeColor, toward);
  // The crown's share of the cloud's own cover, so a cloud's fading edge keeps the colour inside it rather than darkening
  // To its shade where its crown's blur and its outline's both thin out
  const crown = saturate(mask.g.div(max(mask.r, MIN_CROWN_COVER)));
  const cloudColor = mix(shade, lit, crown)
    .add(lit.mul(cloudCoverage.mul(COVERAGE_LIGHT_SHARE)))
    .mul(float(1).add(cloudSunBrighten.mul(sunCosine.mul(0.5).add(0.5))));
  const material = new SpriteNodeMaterial({ depthWrite: false, transparent: true });
  material.positionNode = place;
  material.scaleNode = instancedBufferAttribute(scales);
  material.colorNode = cloudColor;
  material.opacityNode = smoothstep(EDGE_FADE_START, EDGE_FADE_END, mask.r)
    .mul(smoothstep(0, 1, saturate(elevation.add(BELOW_FADE_START).mul(BELOW_FADE_SCALE))))
    .mul(step(instancedBufferAttribute<"float">(ranks), cover));
  material.alphaTest = DROPPED_COVERAGE;
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
      ranks.setX(instance, (cloud + 0.5) / clouds.length);
    }
    positions.needsUpdate = true;
    scales.needsUpdate = true;
    cells.needsUpdate = true;
    ranks.needsUpdate = true;
  };
  return {
    cover,
    dispose: () => {
      material.dispose();
    },
    places,
    sprite,
  };
};
