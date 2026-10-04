import type { SceneContext } from "#src/models/scene/SceneContext";
import type { SceneWitness } from "#src/models/scene/SceneWitness";
import type { Node } from "three/webgpu";

import { WitnessTarget, WitnessTargets } from "#parity/witness/WitnessTarget";
import { InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";
import { Color, FloatType, Layers, Mesh, RenderTarget, Vector2 } from "three";
import { float, normalWorld, positionView, vec3, vec4 } from "three/tsl";
import { MeshBasicNodeMaterial, NodeMaterial } from "three/webgpu";

// The layer the witness's parts are drawn on alone while its targets render, past every layer the scenes use
const TARGET_LAYER = 31;
// The material a target draws a part with, built once for the material the part wears (whose colour the albedo
// Reads), the target and the part's identifier and family, and kept: a material built afresh each read is a pipeline
// WebGPU compiles and keeps, so a tool reading hundreds of views would fill the page until it crashed
const sourceTargetMaterialsMap = new WeakMap<object, Map<string, MeshBasicNodeMaterial>>();
// The one target every read draws into, rebuilt only when the drawing buffer's size changes
let renderTarget: RenderTarget | undefined;
// The witness render's G-buffer at its current view, one floating-point target a quantity, each read back from the
// Renderer as rows of four floats a pixel: the albedo its exported material draws unlit, the depth along the view in
// Metres, the world normal (encoded into 0 to 1, as `readWitnessTargets` decodes it), and the part (its identifier
// From one, the order the header lists it in) with its family's index, the families listed in that order. Only the
// Witness's parts are drawn, over nothing, so a pixel no part covers is zero throughout. Only the targets asked for
// Are drawn, every one unless told, each handed back as base64, the one form a page hands its caller bytes in. Every
// Part keeps its own material, handed back once the targets are read
export const renderWitnessTargets = async (
  witness: SceneWitness,
  context: SceneContext | undefined,
  requestedTargets: readonly WitnessTarget[] = WitnessTargets,
): Promise<{
  families: string[];
  height: number;
  parts: { family: string; id: number; mesh: string }[];
  targets: Partial<Record<WitnessTarget, string>>;
  width: number;
}> => {
  if (!context) throw new InvalidOperationError(Operation.Read, "witness", "the scene has not rendered yet");
  const { camera, renderer, scene } = context;
  const { x: width, y: height } = renderer.getDrawingBufferSize(new Vector2());
  const parts: { family: string; id: number; mesh: string }[] = [];
  const drawnMeshes: { familyIndex: number; id: number; mesh: Mesh }[] = [];
  for (const [familyIndex, familyGroup] of witness.parts.children.entries()) {
    if (!familyGroup.visible) continue;
    for (const part of familyGroup.children) {
      const id = parts.length + 1;
      parts.push({ family: familyGroup.name, id, mesh: part.name });
      part.traverse((object) => {
        if (object instanceof Mesh) drawnMeshes.push({ familyIndex, id, mesh: object });
      });
    }
  }
  const getTargetMaterial = (
    target: WitnessTarget,
    { familyIndex, id, mesh }: (typeof drawnMeshes)[number],
  ): MeshBasicNodeMaterial => {
    const targetMaterials = sourceTargetMaterialsMap.get(mesh.material) ?? new Map<string, MeshBasicNodeMaterial>();
    sourceTargetMaterialsMap.set(mesh.material, targetMaterials);
    const key = `${target}/${id}/${familyIndex}`;
    const cached = targetMaterials.get(key);
    if (cached) return cached;
    const material = new MeshBasicNodeMaterial();
    material.toneMapped = false;
    const albedo = mesh.material instanceof NodeMaterial ? (mesh.material.colorNode as Node<"vec3"> | null) : null;
    const targetNodeMap: Record<WitnessTarget, Node<"vec4">> = {
      [WitnessTarget.Albedo]: vec4(albedo ?? vec3(1), 1),
      [WitnessTarget.Depth]: vec4(positionView.z.negate(), 0, 0, 1),
      // Halved and lifted into 0 to 1, since the material's colour output clips what falls below 0, which took every
      // Normal's negative components; read back, it is let down again
      [WitnessTarget.Normal]: vec4(normalWorld.mul(0.5).add(0.5), 1),
      [WitnessTarget.Part]: vec4(float(id), float(familyIndex), 0, 1),
    };
    material.colorNode = targetNodeMap[target];
    targetMaterials.set(key, material);
    return material;
  };
  const cameraLayers = new Layers();
  cameraLayers.mask = camera.layers.mask;
  const { background, backgroundNode } = scene;
  const clearColor = renderer.getClearColor(new Color());
  const clearAlpha = renderer.getClearAlpha();
  const originalMaterials = drawnMeshes.map(({ mesh }) => mesh.material);
  if (renderTarget?.width !== width || renderTarget.height !== height) {
    renderTarget?.dispose();
    renderTarget = new RenderTarget(width, height, { type: FloatType });
  }
  const drawnTarget = renderTarget;
  const targets: Partial<Record<WitnessTarget, string>> = {};
  // A failed readback still hands the scene back as it was, so a later render or capture never draws the targets
  await withFinalizerAsync(
    async () => {
      camera.layers.set(TARGET_LAYER);
      for (const { mesh } of drawnMeshes) mesh.layers.enable(TARGET_LAYER);
      scene.background = null;
      scene.backgroundNode = null;
      renderer.setClearColor(0, 0);
      for (const target of requestedTargets) {
        const targetMaterials = drawnMeshes.map((drawn) => getTargetMaterial(target, drawn));
        // oxlint-disable-next-line no-await-in-loop -- one target is read back before the next is drawn into it
        targets[target] = await withFinalizerAsync(
          async () => {
            for (const [index, { mesh }] of drawnMeshes.entries())
              mesh.material = targetMaterials[index] ?? mesh.material;
            renderer.setRenderTarget(drawnTarget);
            renderer.render(scene, camera);
            const pixels = await renderer.readRenderTargetPixelsAsync(drawnTarget, 0, 0, width, height);
            return new Uint8Array(pixels.buffer, pixels.byteOffset, pixels.byteLength).toBase64();
          },
          () => {
            for (const [index, { mesh }] of drawnMeshes.entries())
              mesh.material = originalMaterials[index] ?? mesh.material;
          },
        );
      }
    },
    () => {
      renderer.setRenderTarget(null);
      renderer.setClearColor(clearColor, clearAlpha);
      scene.background = background;
      scene.backgroundNode = backgroundNode;
      camera.layers.mask = cameraLayers.mask;
      for (const { mesh } of drawnMeshes) mesh.layers.disable(TARGET_LAYER);
    },
  );
  return { families: witness.parts.children.map(({ name }) => name), height, parts, targets, width };
};
