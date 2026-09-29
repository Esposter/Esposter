import type { TerrainOptions } from "#src/terrain/TerrainOptions";
import type { GroundCapture } from "#src/vegetation/GroundCapture";
import type { Scene, Vector3Like } from "three";
import type { Renderer } from "three/webgpu";

import { Color } from "three";

const clearColor = new Color();
const previousClearColor = new Color();
// Redraws the capture centred on a world position: the camera stands above the highest ground at the scene's
// Coordinates, which are the world's less the floating origin, and the scene is drawn through the capture's material
// With no background. An empty texel is black, which the grass reads as no ground to grow on
export const renderGroundCapture = (
  renderer: Renderer,
  scene: Scene,
  { camera, center, material, renderTarget }: GroundCapture,
  { maxHeight }: Pick<TerrainOptions, "maxHeight">,
  worldCenter: Vector3Like,
  origin: Vector3Like,
): void => {
  center.value.set(worldCenter.x, worldCenter.z);
  camera.position.set(worldCenter.x - origin.x, maxHeight + 1, worldCenter.z - origin.z);
  camera.far = maxHeight * 4;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  const previousRenderTarget = renderer.getRenderTarget();
  const previousClearAlpha = renderer.getClearAlpha();
  renderer.getClearColor(previousClearColor);
  const previousOverrideMaterial = scene.overrideMaterial;
  const previousBackgroundNode = scene.backgroundNode;
  scene.overrideMaterial = material;
  scene.backgroundNode = null;
  renderer.setClearColor(clearColor, 0);
  renderer.setRenderTarget(renderTarget);
  renderer.clear();
  renderer.render(scene, camera);
  renderer.setRenderTarget(previousRenderTarget);
  renderer.setClearColor(previousClearColor, previousClearAlpha);
  scene.overrideMaterial = previousOverrideMaterial;
  scene.backgroundNode = previousBackgroundNode;
};
