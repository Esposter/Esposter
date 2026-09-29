import type { QualityTierSettings } from "#src/renderer/QualityTierSettings";
import type { Camera, Scene } from "three";
import type { Renderer } from "three/webgpu";

import { Color } from "three";
import { bloom } from "three/examples/jsm/tsl/display/BloomNode.js";
import { smaa } from "three/examples/jsm/tsl/display/SMAANode.js";
import { toonOutlinePass } from "three/tsl";
import { RenderPipeline } from "three/webgpu";

const OUTLINE_COLOR = 0x2a2238;
const OUTLINE_THICKNESS = 0.003;
const BLOOM_STRENGTH = 0.35;
const BLOOM_RADIUS = 0.4;
const BLOOM_THRESHOLD = 0.85;
// The frame after the scene: one pass draws the scene with every toon material's outline, bloom lifts only what is
// Brighter than nearly white (the sun, glints and elemental light), and SMAA smooths the edges the renderer drew
// Without multisampling, which a post chain cannot use anyway
export const createPostPipeline = (
  renderer: Renderer,
  scene: Scene,
  camera: Camera,
  { isBloomEnabled }: Pick<QualityTierSettings, "isBloomEnabled">,
): RenderPipeline => {
  const renderPipeline = new RenderPipeline(renderer);
  const scenePass = toonOutlinePass(scene, camera, new Color(OUTLINE_COLOR), OUTLINE_THICKNESS, 1);
  const composed = isBloomEnabled
    ? scenePass.add(bloom(scenePass, BLOOM_STRENGTH, BLOOM_RADIUS, BLOOM_THRESHOLD))
    : scenePass;
  renderPipeline.outputNode = smaa(composed);
  return renderPipeline;
};
