import type { Camera } from "three";
import type { TextureNode } from "three/webgpu";

import GTAONode from "three/examples/jsm/tsl/display/GTAONode.js";
import { getNormalFromDepth, sample, uniform } from "three/tsl";

// How far behind a surface, as a share of the occlusion's radius, a sample still counts as occluding it rather than
// As a nearer surface standing in front with a gap behind it
const OCCLUSION_THICKNESS_SHARE = 4;
// The scene's screen-space occlusion over its depth, reaching the radius in metres round each pixel, its normals rebuilt
// From that depth as the node rebuilds them when it is handed none. The scene's pipeline and the witness's occlusion
// Target both draw it here, so the light solved through the target is the light the scene draws
export const createOcclusionNode = (depthNode: TextureNode, camera: Camera, radius: number): GTAONode => {
  const cameraProjectionMatrixInverse = uniform(camera.projectionMatrixInverse);
  const normalNode = sample((uv) => getNormalFromDepth(uv, depthNode, cameraProjectionMatrixInverse));
  const occlusionNode = new GTAONode(depthNode, normalNode, camera);
  occlusionNode.radius.value = radius;
  occlusionNode.thickness.value = radius * OCCLUSION_THICKNESS_SHARE;
  return occlusionNode;
};
