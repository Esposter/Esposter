import type { PostPipeline } from "#src/post/PostPipeline";
import type { PostPipelineOptions } from "#src/post/PostPipelineOptions";
import type { Node } from "three/webgpu";

import { createHeightFogNode } from "#src/post/createHeightFogNode";
import { AntialiasingMode } from "#src/renderer/AntialiasingMode";
import { bilateralBlur } from "three/examples/jsm/tsl/display/BilateralBlurNode.js";
import { bloom } from "three/examples/jsm/tsl/display/BloomNode.js";
import { depthAwareBlend } from "three/examples/jsm/tsl/display/depthAwareBlend.js";
import { godrays } from "three/examples/jsm/tsl/display/GodraysNode.js";
import { lut3D } from "three/examples/jsm/tsl/display/Lut3DNode.js";
import { smaa } from "three/examples/jsm/tsl/display/SMAANode.js";
import { traa } from "three/examples/jsm/tsl/display/TRAANode.js";
import { float, modelViewMatrix, mrt, output, positionLocal, renderOutput, texture3D, vec4, velocity } from "three/tsl";
import { RenderPipeline, ToonOutlinePassNode } from "three/webgpu";

const BLOOM_STRENGTH = 0.35;
const BLOOM_RADIUS = 0.4;
const BLOOM_THRESHOLD = 0.85;
const MIN_VIEW_DISTANCE = 0.001;
// The frame after the scene, in the order light meets the eye:
// 1. One pass draws the scene with every toon material's outline, the outline thinning past its fade distance
// 2. God rays are marched through the sun's shadow at half resolution, blurred, and blended in the sun's colour
// 3. The height fog hazes what lies far or low, the outlines with it
// 4. Bloom lifts only what is brighter than nearly white: the sun, glints and elemental light
// 5. The grade maps display colours through the region's LUT, so it follows the tone mapping rather than feeding it
// TRAA resolves the scene's edges before the tone mapping, from a velocity target the scene pass writes beside its
// Colour; SMAA smooths the graded frame instead, for a tier that pays for neither
export const createPostPipeline = ({
  camera,
  fogUniforms,
  godraysLight,
  gradeLutTexture,
  isBloomed = true,
  postUniforms: { godraysColor, gradeIntensity, outlineColor, outlineFadeDistance, outlineThickness },
  qualityTierSettings: { antialiasingMode, godraysStepCount, isBloomEnabled },
  renderer,
  scene,
}: PostPipelineOptions): PostPipeline => {
  const renderPipeline = new RenderPipeline(renderer);
  renderPipeline.outputColorTransform = false;
  // The outline pass extrudes by this times the clip w, a constant width on screen: scaled by the fade distance over
  // The view distance, it keeps that width up close and holds a constant width in the world past it
  const viewDistance = modelViewMatrix.mul(vec4(positionLocal, 1)).z.negate().max(MIN_VIEW_DISTANCE);
  const thicknessNode = outlineThickness.mul(outlineFadeDistance.div(viewDistance).min(1));
  const scenePass = new ToonOutlinePassNode(scene, camera, outlineColor, thicknessNode, float(1));
  const isTraa = antialiasingMode === AntialiasingMode.Traa;
  if (isTraa) scenePass.setMRT(mrt({ output, velocity }));
  const sceneColor = scenePass.getTextureNode("output");
  const sceneDepth = scenePass.getTextureNode("depth");
  const postPipeline: PostPipeline = { renderPipeline };
  let litNode: Node<"vec4"> = sceneColor;

  if (godraysLight && godraysStepCount > 0) {
    const godraysNode = godrays(sceneDepth, camera, godraysLight);
    godraysNode.raymarchSteps.value = godraysStepCount;
    const blurredGodrays = bilateralBlur(godraysNode.getTextureNode());
    litNode = depthAwareBlend(sceneColor, blurredGodrays.getTextureNode(), sceneDepth, camera, {
      blendColor: godraysColor,
    });
    postPipeline.godraysNode = godraysNode;
  }

  const foggedNode = createHeightFogNode(litNode, sceneDepth, camera, fogUniforms);
  let bloomedNode: Node<"vec4"> = foggedNode;

  if (isBloomed && isBloomEnabled) {
    const bloomNode = bloom(foggedNode, BLOOM_STRENGTH, BLOOM_RADIUS, BLOOM_THRESHOLD);
    bloomedNode = foggedNode.add(bloomNode);
    postPipeline.bloomNode = bloomNode;
  }

  const resolvedNode = isTraa
    ? traa(bloomedNode, sceneDepth, scenePass.getTextureNode("velocity"), camera)
    : bloomedNode;
  const displayNode = renderOutput(resolvedNode);
  const gradedNode = gradeLutTexture
    ? lut3D(displayNode, texture3D(gradeLutTexture), gradeLutTexture.image.width, gradeIntensity)
    : displayNode;
  renderPipeline.outputNode = isTraa ? gradedNode : smaa(gradedNode);
  return postPipeline;
};
