import type { Camera, Frustum, Vector3 } from "three";

import { Matrix4 } from "three";

// A setter of a frustum from a camera's view in world coordinates, the scene's view moved by the origin, so a selection
// Made against it never sees the floating origin. The camera's matrices are brought up to date first. Its matrices are
// Kept by the setter, so each frame writes them rather than allocating them
export const createFrustumSetter = () => {
  const originMatrix = new Matrix4();
  const viewProjection = new Matrix4();
  return (frustum: Frustum, camera: Camera, origin: Vector3): void => {
    camera.updateMatrixWorld();
    originMatrix.makeTranslation(-origin.x, -origin.y, -origin.z);
    viewProjection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse).multiply(originMatrix);
    frustum.setFromProjectionMatrix(viewProjection, camera.coordinateSystem);
  };
};
