import { PerspectiveCamera, Vector3 } from "three";

// A point in three's axes projected into an image of the size given from a pose along `CAMERA_POSE_AXES` (metres, then
// Degrees), as the witness's camera draws it: three's own perspective camera, turned by its heading then its pitch, so a
// Pose read off an image is the pose the page renders. The pixel runs right and down from the top left; a point behind
// The eye lands wherever the projection puts it, and its depth along the view says so
export const projectWitnessPoint = (
  [x = 0, y = 0, z = 0, yaw = 0, pitch = 0, fov = 45]: readonly number[],
  point: readonly [number, number, number],
  width: number,
  height: number,
): { depth: number; pixel: [number, number] } => {
  const camera = new PerspectiveCamera(fov, width / height);
  camera.position.set(x, y, z);
  camera.rotation.set((pitch * Math.PI) / 180, (yaw * Math.PI) / 180, 0, "YXZ");
  camera.updateMatrixWorld();
  const projected = new Vector3(...point).project(camera);
  const depth = -new Vector3(...point).applyMatrix4(camera.matrixWorldInverse).z;
  return { depth, pixel: [((projected.x + 1) / 2) * width, ((1 - projected.y) / 2) * height] };
};
