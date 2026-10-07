import type { SceneContext } from "#src/models/scene/SceneContext";
import type { SceneWitness } from "#src/models/scene/SceneWitness";
import type { Camera, Object3D, Scene } from "three";
import type GTAONode from "three/examples/jsm/tsl/display/GTAONode.js";
import type { Node, PassNode } from "three/webgpu";

import { WitnessShadowMaterial } from "#parity/models/witness/WitnessShadowMaterial";
import { WitnessTarget, WitnessTargets } from "#parity/models/witness/WitnessTarget";
import { SCENE_FAMILY_KEY } from "#src/services/scene/constants";
import { InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";
import { createOcclusionNode, StoneNodeMaterial } from "genshin-engine";
import { Color, DirectionalLight, FloatType, Layers, Light, Mesh, RenderTarget, Vector2 } from "three";
import { cameraViewMatrix, float, normalWorld, pass, positionView, uniform, vec3, vec4 } from "three/tsl";
import { MeshBasicNodeMaterial, NodeMaterial, RenderPipeline } from "three/webgpu";

// The layer the witness's parts are drawn on alone while its targets render, past every layer the scenes use
const TARGET_LAYER = 31;
// The material a target draws a part with, built once for the material the part wears (whose colour the albedo
// Reads), the target and the part's identifier and family, and kept: a material built afresh each read is a pipeline
// WebGPU compiles and keeps, so a tool reading hundreds of views would fill the page until it crashed
const sourceTargetMaterialsMap = new WeakMap<object, Map<string, NodeMaterial>>();
// The sun's colour at its strength, which the shadow target reads each pixel's shadowed light against, written from
// The scene's shadow-casting light before each read
const sunRadiance = uniform(new Color());
// The one target every read draws into, rebuilt only when the drawing buffer's size changes
let renderTarget: RenderTarget | undefined;
// The pipeline the occlusion target is drawn through, the scene's own occlusion over the parts' depth, rebuilt only when
// The scene, its camera or the occlusion's reach changes. The pipeline, the depth pass and the occlusion each hold
// Targets of their own, so a rebuild releases all three
let occlusion:
  | undefined
  | {
      camera: Camera;
      occlusionNode: GTAONode;
      radius: number;
      renderPipeline: RenderPipeline;
      scene: Scene;
      scenePass: PassNode;
    };
// The witness render's G-buffer at its current view, one floating-point target a quantity, each read back from the
// Renderer as rows of four floats a pixel: the albedo its exported material draws unlit, the depth along the view in
// Metres, the light the material adds after lighting, the world normal its normal map bends (encoded into 0 to 1, as
// `readWitnessTargets` decodes it), the share of the sun reaching it through the scene's shadows, the share of light
// The scene's occlusion leaves it over the parts' own depth (all of it where the scene draws none), and the part (its
// Identifier from one, the order the header lists it in) with its family's index, the families listed in that order.
// Only the witness's parts are drawn, over nothing, so a pixel no part covers is zero throughout but in the occlusion,
// Which leaves it whole. Only the targets asked for are drawn, every
// One unless told, each handed back as base64, the one form a page hands its caller bytes in. Every
// Part keeps its own material, handed back once the targets are read. Told to, it draws the scene's own parts in
// Place of the witness's, each object the scene marks with a family (`SCENE_FAMILY_KEY`) a part of that family, under
// The witness's family indices, so ours and the exports' are compared target by target
export const renderWitnessTargets = async (
  witness: SceneWitness,
  context: SceneContext | undefined,
  requestedTargets: readonly WitnessTarget[] = WitnessTargets,
  isScene = false,
): Promise<{
  families: string[];
  height: number;
  parts: { family: string; id: number; mesh: string }[];
  targets: Partial<Record<WitnessTarget, string>>;
  width: number;
}> => {
  if (!context) throw new InvalidOperationError(Operation.Read, "witness", "the scene has not rendered yet");
  const { camera, occlusionRadius, renderer, scene } = context;
  const { x: width, y: height } = renderer.getDrawingBufferSize(new Vector2());
  const parts: { family: string; id: number; mesh: string }[] = [];
  const drawnMeshes: { familyIndex: number; id: number; mesh: Mesh }[] = [];
  const families = witness.parts.children.map(({ name }) => name);
  const addPart = (family: string, part: Object3D): void => {
    const id = parts.length + 1;
    parts.push({ family, id, mesh: part.name });
    part.traverseVisible((object) => {
      if (object instanceof Mesh) drawnMeshes.push({ familyIndex: families.indexOf(family), id, mesh: object });
    });
  };
  if (isScene)
    scene.traverseVisible((object) => {
      const family = object.userData[SCENE_FAMILY_KEY] as string | undefined;
      if (family && families.includes(family)) addPart(family, object);
    });
  else
    for (const familyGroup of witness.parts.children) {
      if (!familyGroup.visible) continue;
      for (const part of familyGroup.children) addPart(familyGroup.name, part);
    }
  const getTargetMaterial = (
    target: WitnessTarget,
    { familyIndex, id, mesh }: (typeof drawnMeshes)[number],
  ): NodeMaterial => {
    const targetMaterials = sourceTargetMaterialsMap.get(mesh.material) ?? new Map<string, NodeMaterial>();
    sourceTargetMaterialsMap.set(mesh.material, targetMaterials);
    const key = `${target}/${id}/${familyIndex}`;
    const cached = targetMaterials.get(key);
    if (cached) return cached;
    if (target === WitnessTarget.Shadow) {
      const shadowMaterial = new WitnessShadowMaterial(sunRadiance);
      targetMaterials.set(key, shadowMaterial);
      return shadowMaterial;
    }
    const material = new MeshBasicNodeMaterial();
    material.toneMapped = false;
    const albedo = mesh.material instanceof NodeMaterial ? (mesh.material.colorNode as Node<"vec3"> | null) : null;
    // The part's own normal map bends the normal the target writes, as the G-buffer the game lights holds it, taken
    // From the view into the world as `normalWorld` takes the geometry's
    const sourceNormal =
      mesh.material instanceof NodeMaterial ? (mesh.material.normalNode as Node<"vec3"> | null) : null;
    const worldNormal = sourceNormal
      ? sourceNormal.transformNormalByInverseViewMatrix(cameraViewMatrix).normalize()
      : normalWorld;
    const emission =
      mesh.material instanceof StoneNodeMaterial ? (mesh.material.emissiveNode as Node<"vec3"> | null) : null;
    const targetNodeMap: Record<Exclude<WitnessTarget, WitnessTarget.Shadow>, Node<"vec4">> = {
      [WitnessTarget.Albedo]: vec4(albedo ?? vec3(1), 1),
      [WitnessTarget.Depth]: vec4(positionView.z.negate(), 0, 0, 1),
      [WitnessTarget.Emission]: vec4(emission ?? vec3(0), 1),
      // Halved and lifted into 0 to 1, since the material's colour output clips what falls below 0, which took every
      // Normal's negative components; read back, it is let down again
      [WitnessTarget.Normal]: vec4(worldNormal.mul(0.5).add(0.5), 1),
      // Drawn only for its depth, which the occlusion's pass reads
      [WitnessTarget.Occlusion]: vec4(1),
      [WitnessTarget.Part]: vec4(float(id), float(familyIndex), 0, 1),
    };
    material.colorNode = targetNodeMap[target];
    targetMaterials.set(key, material);
    return material;
  };
  // The scene's lights light the shadow target, so they join its layer while the targets are drawn; the sun is the
  // Light that casts the scene's shadows
  const lights: Light[] = [];
  scene.traverse((object) => {
    if (object instanceof Light) lights.push(object);
  });
  const sun = lights.find((light) => light instanceof DirectionalLight && light.castShadow);
  if (sun) sunRadiance.value.copy(sun.color).multiplyScalar(sun.intensity);
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
  if (occlusion?.scene !== scene || occlusion.camera !== camera || occlusion.radius !== occlusionRadius) {
    occlusion?.renderPipeline.dispose();
    occlusion?.scenePass.dispose();
    occlusion?.occlusionNode.dispose();
    const renderPipeline = new RenderPipeline(renderer);
    renderPipeline.outputColorTransform = false;
    const scenePass = pass(scene, camera);
    const occlusionNode = createOcclusionNode(scenePass.getTextureNode("depth"), camera, occlusionRadius);
    renderPipeline.outputNode = occlusionRadius > 0 ? vec4(vec3(occlusionNode.getTextureNode().r), 1) : vec4(1);
    occlusion = { camera, occlusionNode, radius: occlusionRadius, renderPipeline, scene, scenePass };
  }
  const { renderPipeline: occlusionPipeline } = occlusion;
  const targets: Partial<Record<WitnessTarget, string>> = {};
  // A failed readback still hands the scene back as it was, so a later render or capture never draws the targets
  await withFinalizerAsync(
    async () => {
      camera.layers.set(TARGET_LAYER);
      for (const { mesh } of drawnMeshes) mesh.layers.enable(TARGET_LAYER);
      for (const light of lights) light.layers.enable(TARGET_LAYER);
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
            if (target === WitnessTarget.Occlusion) occlusionPipeline.render();
            else renderer.render(scene, camera);
            const pixels = await renderer.readRenderTargetPixelsAsync(drawnTarget, 0, 0, width, height);
            // WebGPU copies a target out in rows padded to 256 bytes, so a width whose row does not fill its last
            // Block (any aspect but the few whose width works out to a multiple of 16) carries each row's padding,
            // Which is dropped
            const paddedRowLength = pixels.length / height;
            const rows = Array.from({ length: height }, (_row, row) =>
              pixels.subarray(row * paddedRowLength, row * paddedRowLength + width * 4),
            );
            const packed = new Float32Array(width * height * 4);
            for (const [row, values] of rows.entries()) packed.set(values, row * width * 4);
            return new Uint8Array(packed.buffer).toBase64();
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
      for (const light of lights) light.layers.disable(TARGET_LAYER);
    },
  );
  return { families, height, parts, targets, width };
};
