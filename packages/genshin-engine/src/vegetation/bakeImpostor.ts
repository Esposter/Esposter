import type { Impostor } from "#src/models/vegetation/Impostor";
import type { ImpostorPart } from "#src/models/vegetation/ImpostorPart";
import type { Renderer } from "three/webgpu";

import { Box3, Color, DoubleSide, Mesh, OrthographicCamera, Scene } from "three";
import { color, normalViewGeometry, vec4 } from "three/tsl";
import { MeshBasicNodeMaterial, RenderTarget } from "three/webgpu";

const CLEAR_COLOR = new Color();
const previousClearColor = new Color();
// A mesh's parts baked once from its side, as an orthographic camera standing off its upright axis sees them: once in
// Each part's own colour and once in its normal, both unlit, each into a target framing the mesh from its axis out to
// Its widest on either side and from its lowest point to its highest. A part with a mask is cut by it, as a leaf card
// Is, and both faces are drawn, as the crown's cards are, each in its geometry's normal unturned on its back, as the
// Leaf material lights it. The renderer's target and clear colour are given back as they were
export const bakeImpostor = (renderer: Renderer, parts: readonly ImpostorPart[], resolution: number): Impostor => {
  const bounds = new Box3();
  for (const { geometry } of parts) {
    geometry.computeBoundingBox();
    if (geometry.boundingBox) bounds.union(geometry.boundingBox);
  }
  const radius = Math.max(-bounds.min.x, bounds.max.x, -bounds.min.z, bounds.max.z);
  const width = radius * 2;
  const height = bounds.max.y - bounds.min.y;
  const scale = resolution / Math.max(width, height);
  const albedoTarget = new RenderTarget(Math.ceil(width * scale), Math.ceil(height * scale));
  const normalTarget = new RenderTarget(Math.ceil(width * scale), Math.ceil(height * scale));
  const camera = new OrthographicCamera(-radius, radius, bounds.max.y, bounds.min.y, 0, radius * 2 + 2);
  camera.position.z = radius + 1;
  camera.updateMatrixWorld();
  const bakeScene = new Scene();
  const bakeMeshes = parts.map(({ color: partColor, geometry, maskNode }) => {
    const albedoMaterial = new MeshBasicNodeMaterial({ side: DoubleSide });
    const normalMaterial = new MeshBasicNodeMaterial({ side: DoubleSide });
    albedoMaterial.outputNode = vec4(color(new Color(partColor)), 1);
    normalMaterial.outputNode = vec4(normalViewGeometry.mul(0.5).add(0.5), 1);
    if (maskNode) albedoMaterial.maskNode = normalMaterial.maskNode = maskNode;
    const mesh = new Mesh(geometry, albedoMaterial);
    bakeScene.add(mesh);
    return { albedoMaterial, mesh, normalMaterial };
  });
  const previousRenderTarget = renderer.getRenderTarget();
  const previousClearAlpha = renderer.getClearAlpha();
  renderer.getClearColor(previousClearColor);
  renderer.setClearColor(CLEAR_COLOR, 0);
  renderer.setRenderTarget(albedoTarget);
  renderer.clear();
  renderer.render(bakeScene, camera);
  for (const { mesh, normalMaterial } of bakeMeshes) mesh.material = normalMaterial;
  renderer.setRenderTarget(normalTarget);
  renderer.clear();
  renderer.render(bakeScene, camera);
  renderer.setRenderTarget(previousRenderTarget);
  renderer.setClearColor(previousClearColor, previousClearAlpha);
  for (const { albedoMaterial, normalMaterial } of bakeMeshes) {
    albedoMaterial.dispose();
    normalMaterial.dispose();
  }
  return { albedoTarget, bottom: bounds.min.y, height, normalTarget, width };
};
