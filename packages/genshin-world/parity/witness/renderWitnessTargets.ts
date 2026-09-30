import type { SceneWitness } from "#src/models/scene/SceneWitness";
import type { Node } from "three/webgpu";

import { WitnessTarget } from "#parity/witness/WitnessTarget";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { Color, FloatType, Layers, Mesh, RenderTarget, Vector2 } from "three";
import { float, normalWorld, positionView, vec3, vec4 } from "three/tsl";
import { MeshBasicNodeMaterial, NodeMaterial } from "three/webgpu";

// The layer the witness's parts are drawn on alone while its targets render, past every layer the scenes use
const TARGET_LAYER = 31;
// A floating-point buffer as base64, the one form a page hands its caller bytes in
const toBase64 = (values: Float32Array): string => {
  const bytes = new Uint8Array(values.buffer, values.byteOffset, values.byteLength);
  const chunks: string[] = [];
  for (let start = 0; start < bytes.length; start += 0x8000)
    chunks.push(String.fromCodePoint(...bytes.subarray(start, start + 0x8000)));
  return window.btoa(chunks.join(""));
};
// The witness render's G-buffer at its current view, one floating-point target a quantity, each read back from the
// Renderer as rows of four floats a pixel: the albedo its exported material draws unlit, the depth along the view in
// Metres, the world normal, and the part (its identifier from one, the order the header lists it in) with its family's
// Index, the families listed in that order. Only the witness's parts are drawn, over nothing, so a pixel no part covers is zero throughout. Every part
// Keeps its own material, handed back once the targets are read
export const renderWitnessTargets = async (
  witness: SceneWitness,
): Promise<{
  families: string[];
  height: number;
  parts: { family: string; id: number; mesh: string }[];
  targets: Record<WitnessTarget, string>;
  width: number;
}> => {
  const context = witness.context.value;
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
  const createTargetMaterial = (
    target: WitnessTarget,
    { familyIndex, id, mesh }: (typeof drawnMeshes)[number],
  ): MeshBasicNodeMaterial => {
    const material = new MeshBasicNodeMaterial();
    material.toneMapped = false;
    const albedo = mesh.material instanceof NodeMaterial ? (mesh.material.colorNode as Node<"vec3"> | null) : null;
    const targetNodeMap: Record<WitnessTarget, Node<"vec4">> = {
      [WitnessTarget.Albedo]: vec4(albedo ?? vec3(1), 1),
      [WitnessTarget.Depth]: vec4(positionView.z.negate(), 0, 0, 1),
      [WitnessTarget.Normal]: vec4(normalWorld, 1),
      [WitnessTarget.Part]: vec4(float(id), float(familyIndex), 0, 1),
    };
    material.colorNode = targetNodeMap[target];
    return material;
  };
  const cameraLayers = new Layers();
  cameraLayers.mask = camera.layers.mask;
  const { background, backgroundNode } = scene;
  const clearColor = renderer.getClearColor(new Color());
  const clearAlpha = renderer.getClearAlpha();
  const originalMaterials = drawnMeshes.map(({ mesh }) => mesh.material);
  const renderTarget = new RenderTarget(width, height, { type: FloatType });
  camera.layers.set(TARGET_LAYER);
  for (const { mesh } of drawnMeshes) mesh.layers.enable(TARGET_LAYER);
  scene.background = null;
  scene.backgroundNode = null;
  renderer.setClearColor(0, 0);
  const targets = {} as Record<WitnessTarget, string>;
  for (const target of Object.values(WitnessTarget)) {
    const targetMaterials = drawnMeshes.map((drawn) => createTargetMaterial(target, drawn));
    for (const [index, { mesh }] of drawnMeshes.entries()) mesh.material = targetMaterials[index] ?? mesh.material;
    renderer.setRenderTarget(renderTarget);
    renderer.render(scene, camera);
    // oxlint-disable-next-line no-await-in-loop -- one target is read back before the next is drawn into it
    const pixels = (await renderer.readRenderTargetPixelsAsync(renderTarget, 0, 0, width, height)) as Float32Array;
    targets[target] = toBase64(pixels);
    for (const material of targetMaterials) material.dispose();
  }
  renderer.setRenderTarget(null);
  renderer.setClearColor(clearColor, clearAlpha);
  scene.background = background;
  scene.backgroundNode = backgroundNode;
  camera.layers.mask = cameraLayers.mask;
  for (const [index, { mesh }] of drawnMeshes.entries()) {
    mesh.layers.disable(TARGET_LAYER);
    mesh.material = originalMaterials[index] ?? mesh.material;
  }
  renderTarget.dispose();
  return { families: witness.parts.children.map(({ name }) => name), height, parts, targets, width };
};
