import { MathUtils, Vector3 } from "three";

const X_AXIS = new Vector3(1, 0, 0);
const Y_AXIS = new Vector3(0, 1, 0);
// The direction in the world a point of the screen looks along, for a camera looking along -z, pitched about x then
// Turned about y by its heading, as a camera rotated in that order is: the point as a share of the screen's width
// Across and its height down, so a mark measured off a frame (the sun's glow, the moon's disc) is placed where the
// Frame shows it
export const getScreenDirection = (
  { aspect, fov, pitch, yaw }: { aspect: number; fov: number; pitch: number; yaw: number },
  [x, y]: [number, number],
): Vector3 => {
  const halfHeight = Math.tan(MathUtils.degToRad(fov) / 2);
  return new Vector3((x * 2 - 1) * halfHeight * aspect, (1 - y * 2) * halfHeight, -1)
    .normalize()
    .applyAxisAngle(X_AXIS, pitch)
    .applyAxisAngle(Y_AXIS, yaw);
};
