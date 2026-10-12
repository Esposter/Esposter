import type { Vector3Tuple } from "three";
import type { Node } from "three/webgpu";

import { MINIMUM_OUTLINE_KNOT_SPAN, OUTLINE_PROJECTION_SCALE } from "#src/character/shading/constants";
import { cameraProjectionMatrix, clamp, float, max, positionView, select, vec4 } from "three/tsl";

// The TSL form of getOutlineDepth and getOutlineScale: the vertex's view depth, from the projection's y scale, picks the
// Knot pair it falls between, and the width scale is interpolated across it
export const createOutlineScaleNode = (depths: Vector3Tuple, scales: Vector3Tuple): Node<"float"> => {
  const [nearDepth, middleDepth, farDepth] = depths;
  const [nearScale, middleScale, farScale] = scales;
  const projectionYScale = cameraProjectionMatrix.mul(vec4(0, 1, 0, 0)).y;
  const depth = float(OUTLINE_PROJECTION_SCALE).div(projectionYScale).negate().mul(positionView.z);
  const isNear = depth.lessThan(middleDepth);
  const low = select(isNear, float(nearDepth), float(middleDepth));
  const high = select(isNear, float(middleDepth), float(farDepth));
  const lowScale = select(isNear, float(nearScale), float(middleScale));
  const highScale = select(isNear, float(middleScale), float(farScale));
  const t = clamp(depth.sub(low).div(max(high.sub(low), float(MINIMUM_OUTLINE_KNOT_SPAN))), 0, 1);
  return t.mul(highScale.sub(lowScale)).add(lowScale);
};
