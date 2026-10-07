import { LOGIN_CAMERA_DESIGN_ASPECT, LOGIN_CAMERA_FOV } from "#src/services/login/scene/constants";
import { MathUtils } from "three";

// The login camera's vertical field of view in degrees on a screen of the aspect given: LoginCamera's own from its
// Design aspect outward, and on a narrower screen as wide a view across as the design aspect shows, so its sides are
// Never cropped (Login/Scene/Camera.reference.ts)
export const getLoginCameraFov = (aspect: number): number => {
  if (aspect >= LOGIN_CAMERA_DESIGN_ASPECT) return LOGIN_CAMERA_FOV;
  const halfWidth = Math.tan(MathUtils.degToRad(LOGIN_CAMERA_FOV / 2)) * LOGIN_CAMERA_DESIGN_ASPECT;
  return MathUtils.radToDeg(2 * Math.atan(halfWidth / aspect));
};
