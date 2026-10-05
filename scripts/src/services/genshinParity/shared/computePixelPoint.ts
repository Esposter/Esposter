import type { Matrix4 } from "three";

import { Vector3 } from "three";

// A witness pixel's point in the world: its ray in the view through the camera's inverse projection, scaled to the
// Depth along the view the witness wrote there, and carried into the world by the camera's matrix
export const computePixelPoint = (
  pixel: number,
  { height, width }: { height: number; width: number },
  depth: number,
  { matrixWorld, projectionMatrixInverse }: { matrixWorld: Matrix4; projectionMatrixInverse: Matrix4 },
): Vector3 => {
  const [column, row] = [pixel % width, Math.floor(pixel / width)];
  const view = new Vector3(((column + 0.5) / width) * 2 - 1, 1 - ((row + 0.5) / height) * 2, 0.5).applyMatrix4(
    projectionMatrixInverse,
  );
  return view.multiplyScalar(depth / -view.z).applyMatrix4(matrixWorld);
};
