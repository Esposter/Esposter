import type { Vector3 } from "three";

import { LOGIN_CAMERA_FOV, LOGIN_CAMERA_PITCH, LOGIN_CAMERA_YAW } from "#src/services/login/scene/constants";
import { getScreenDirection } from "genshin-engine";

// The references' frame, 16 wide to 9 high, which every screen point measured off them is a share of
const REFERENCE_ASPECT = 16 / 9;
// The direction a point of a login reference looks along, through the login camera at the title's pose
export const getLoginScreenDirection = (point: [number, number]): Vector3 =>
  getScreenDirection(
    { aspect: REFERENCE_ASPECT, fov: LOGIN_CAMERA_FOV, pitch: LOGIN_CAMERA_PITCH, yaw: LOGIN_CAMERA_YAW },
    point,
  );
