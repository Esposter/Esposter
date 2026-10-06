import type { PostPipeline } from "#src/models/post/PostPipeline";
import type { PostPipelineOptions } from "#src/models/post/PostPipelineOptions";
import type { Node } from "three/webgpu";

import { AntialiasingMode } from "#src/models/renderer/AntialiasingMode";
import { STONE_MASK_OUTPUT } from "#src/nodes/constants";
import { createHeightFogNode } from "#src/post/createHeightFogNode";
import { createOcclusionNode } from "#src/post/createOcclusionNode";
import { UnsignedByteType } from "three";
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
// 1. One pass draws the scene with every toon material's outline, the outline thinning past its fade distance, darkened
//    By its screen-space occlusion where the scene draws it
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
  occlusionRadius,
  postUniforms: { godraysColor, gradeIntensity, outlineColor, outlineFadeDistance, outlineThickness },
  qualityTierSettings: { antialiasingMode, godraysStepCount, isBloomEnabled, isOcclusionEnabled },
  renderer,
  scene,
  stoneLight,
}: PostPipelineOptions): PostPipeline => {
  const renderPipeline = new RenderPipeline(renderer);
  renderPipeline.outputColorTransform = false;
  // The outline pass extrudes by this times the clip w, a constant width on screen: scaled by the fade distance over
  // The view distance, it keeps that width up close and holds a constant width in the world past it
  const viewDistance = modelViewMatrix.mul(vec4(positionLocal, 1)).z.negate().max(MIN_VIEW_DISTANCE);
  const thicknessNode = outlineThickness.mul(outlineFadeDistance.div(viewDistance).min(1));
  const scenePass = new ToonOutlinePassNode(scene, camera, outlineColor, thicknessNode, float(1));
  const isTraa = antialiasingMode === AntialiasingMode.Traa;
  // Beside its colour, the scene pass writes the velocity TRAA resolves by and the stone's mask where the scene asks for
  // Them, every material but the stone's writing none into the mask
  const sceneOutputs: Record<string, Node> = { output };
  if (isTraa) sceneOutputs.velocity = velocity;
  if (stoneLight) sceneOutputs[STONE_MASK_OUTPUT] = float(0);
  scenePass.setMRT(mrt(sceneOutputs));
  const sceneColor = scenePass.getTextureNode("output");
  const sceneDepth = scenePass.getTextureNode("depth");
  // Every pass holding render targets of its own, each released with the pipeline
  const passNodes: { dispose: () => void }[] = [scenePass];
  const postPipeline: PostPipeline = {
    dispose: () => {
      renderPipeline.dispose();
      for (const passNode of passNodes) passNode.dispose();
    },
    renderPipeline,
  };
  let litNode: Node<"vec4"> = sceneColor;

  if (occlusionRadius && isOcclusionEnabled) {
    const occlusionNode = createOcclusionNode(sceneDepth, camera, occlusionRadius);
    passNodes.push(occlusionNode);
    litNode = vec4(sceneColor.rgb.mul(occlusionNode.getTextureNode().r), sceneColor.a);
  }

  if (godraysLight && godraysStepCount > 0) {
    const godraysNode = godrays(sceneDepth, camera, godraysLight);
    godraysNode.raymarchSteps.value = godraysStepCount;
    const blurredGodrays = bilateralBlur(godraysNode.getTextureNode());
    passNodes.push(godraysNode, blurredGodrays);
    litNode = depthAwareBlend(litNode, blurredGodrays.getTextureNode(), sceneDepth, camera, {
      blendColor: godraysColor,
    });
    postPipeline.godraysNode = godraysNode;
  }

  if (stoneLight) scenePass.getTexture(STONE_MASK_OUTPUT).type = UnsignedByteType;
  const foggedNode = createHeightFogNode(
    litNode,
    sceneDepth,
    camera,
    fogUniforms,
    stoneLight && {
      hazeColor: stoneLight.hazeColor,
      hazeScatterColor: stoneLight.hazeScatterColor,
      maskNode: scenePass.getTextureNode(STONE_MASK_OUTPUT),
    },
  );
  let bloomedNode: Node<"vec4"> = foggedNode;

  if (isBloomed && isBloomEnabled) {
    const bloomNode = bloom(foggedNode, BLOOM_STRENGTH, BLOOM_RADIUS, BLOOM_THRESHOLD);
    passNodes.push(bloomNode);
    bloomedNode = foggedNode.add(bloomNode);
    postPipeline.bloomNode = bloomNode;
  }

  let resolvedNode: Node<"vec4"> = bloomedNode;

  if (isTraa) {
    const traaNode = traa(bloomedNode, sceneDepth, scenePass.getTextureNode("velocity"), camera);
    passNodes.push(traaNode);
    resolvedNode = traaNode;
  }

  const displayNode = renderOutput(resolvedNode);
  const gradedNode = gradeLutTexture
    ? lut3D(displayNode, texture3D(gradeLutTexture), gradeLutTexture.image.width, gradeIntensity)
    : displayNode;

  if (isTraa) renderPipeline.outputNode = gradedNode;
  else {
    const smaaNode = smaa(gradedNode);
    passNodes.push(smaaNode);
    renderPipeline.outputNode = smaaNode;
  }

  return postPipeline;
};
