import type { Matrix4 } from "three";

import { Quaternion, Vector3 } from "three";

const rotation = new Quaternion();
const unitScale = new Vector3(1, 1, 1);
const up = new Vector3(0, 1, 0);

// A matrix written in place to stand a thing at a point, turned to its heading in radians about the vertical and
// Scaled by the given scale, unscaled by default, as an instanced stand-in that walks the ground is drawn
export const composeHeadingMatrix = (
  matrix: Matrix4,
  point: Vector3,
  heading: number,
  scale: Vector3 = unitScale,
): Matrix4 => matrix.compose(point, rotation.setFromAxisAngle(up, heading), scale);
