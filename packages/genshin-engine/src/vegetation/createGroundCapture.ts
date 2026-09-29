import type { GroundCapture } from "#src/vegetation/GroundCapture";

import { TERRAIN_LAYER } from "#src/terrain/constants";
import { HalfFloatType, LinearFilter, OrthographicCamera, Vector2 } from "three";
import { attribute, positionWorld, uniform, vec4 } from "three/tsl";
import { MeshBasicNodeMaterial, RenderTarget } from "three/webgpu";

// A square of the given side in metres, captured at the given texels a side, from a camera looking straight down that
// Sees only the terrain's layer. Half floats keep a height to a few centimetres across a region's range
export const createGroundCapture = (size: number, resolution: number): GroundCapture => {
  const renderTarget = new RenderTarget(resolution, resolution, { type: HalfFloatType });
  renderTarget.texture.magFilter = LinearFilter;
  renderTarget.texture.minFilter = LinearFilter;
  const halfSize = size / 2;
  const camera = new OrthographicCamera(-halfSize, halfSize, halfSize, -halfSize);
  camera.rotation.x = -Math.PI / 2;
  camera.layers.set(TERRAIN_LAYER);
  const material = new MeshBasicNodeMaterial();
  material.outputNode = vec4(attribute("color", "vec3"), positionWorld.y);
  return { camera, center: uniform(new Vector2()), material, renderTarget, size };
};
