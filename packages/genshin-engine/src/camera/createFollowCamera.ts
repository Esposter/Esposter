import type { FollowCamera } from "#src/models/camera/FollowCamera";
import type { FollowCameraOptions } from "#src/models/camera/FollowCameraOptions";

import {
  FOLLOW_CAMERA_ARM_STEP,
  FOLLOW_CAMERA_CLEARANCE,
  FOLLOW_CAMERA_DISTANCE_PER_ZOOM_STEP,
  FOLLOW_CAMERA_EASE_OUT_SPEED,
  FOLLOW_CAMERA_FOV,
  FOLLOW_CAMERA_MAX_DISTANCE,
  FOLLOW_CAMERA_MAX_PITCH,
  FOLLOW_CAMERA_MIN_DISTANCE,
  FOLLOW_CAMERA_MIN_PITCH,
  FOLLOW_CAMERA_NEUTRAL_SENSITIVITY,
  FOLLOW_CAMERA_SLOPE_PITCH_SPEED,
} from "#src/camera/constants";
import { InputAction } from "#src/models/input/InputAction";
import { Euler, Vector3 } from "three";

// The pitch the look is held to, short of the game's limits either way
const clampPitch = (value: number): number =>
  Math.max(FOLLOW_CAMERA_MIN_PITCH, Math.min(FOLLOW_CAMERA_MAX_PITCH, value));
// A camera orbiting a pivot above a body, as the game's follows its character. The look turns it once a frame, clamped
// Short of straight up and down, and zooms it by the wheel within its range. The eye stands on the arm out from the
// Pivot, short of the first landmark a sphere cast along the arm touches and of the first point stepped along it under
// The ground or the water's surface: it is pulled in at once and eases back out once the way clears. With the slope pitch
// On, the pitch settles each frame on the slope the ground rises or falls at along the eye's side
export const createFollowCamera = ({
  camera,
  ground,
  landmarkCollider,
  settings,
}: FollowCameraOptions): FollowCamera => {
  const euler = new Euler().setFromQuaternion(camera.quaternion, "YXZ");
  const armDirection = new Vector3();
  let yaw = euler.y;
  // The camera the world hands over may look straight up, as its default pose does, so the follow camera starts level as
  // A reset does, its look clamped from there rather than from that pose
  let pitch = 0;
  let distance = settings.defaultDistance;
  let armLength = distance;
  camera.fov = FOLLOW_CAMERA_FOV;
  camera.updateProjectionMatrix();
  const turn = (): void => {
    euler.set(pitch, yaw, 0, "YXZ");
    camera.quaternion.setFromEuler(euler);
  };
  const returnToDefaultDistance = (): void => {
    distance = settings.defaultDistance;
  };
  const reset = (facing: number): void => {
    yaw = facing;
    pitch = 0;
    returnToDefaultDistance();
    turn();
  };
  // How far the arm reaches out from the pivot before the ground or the water's surface stands within its clearance
  const computeGroundReach = (pivot: Vector3, reach: number): number => {
    for (let travelled = FOLLOW_CAMERA_ARM_STEP; travelled <= reach; travelled += FOLLOW_CAMERA_ARM_STEP) {
      const x = pivot.x + armDirection.x * travelled;
      const z = pivot.z + armDirection.z * travelled;
      const floorHeight = Math.max(ground.getGround(x, z).height, ground.getWaterLevel());
      if (pivot.y + armDirection.y * travelled < floorHeight + FOLLOW_CAMERA_CLEARANCE)
        return travelled - FOLLOW_CAMERA_ARM_STEP;
    }
    return reach;
  };
  // The pitch that runs the arm parallel to the ground along the eye's side: the rise from under the pivot to the ground
  // The arm reaches across its horizontal run, so the eye keeps its height above the slope
  const computeSlopePitch = (pivot: Vector3): number => {
    const runX = Math.sin(yaw) * distance;
    const runZ = Math.cos(yaw) * distance;
    const rise = ground.getGround(pivot.x + runX, pivot.z + runZ).height - ground.getGround(pivot.x, pivot.z).height;
    return -Math.atan2(rise, distance);
  };
  return {
    follow: (pivot, origin, frameSeconds) => {
      if (settings.slopePitch) {
        const settle = 1 - Math.exp(-FOLLOW_CAMERA_SLOPE_PITCH_SPEED * frameSeconds);
        pitch = clampPitch(pitch + (computeSlopePitch(pivot) - pitch) * settle);
        turn();
      }
      armDirection.set(Math.sin(yaw) * Math.cos(pitch), -Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
      const landmarkReach = landmarkCollider.castSphere(pivot, armDirection, distance, FOLLOW_CAMERA_CLEARANCE);
      // A landmark never pulls the eye in under the minimum distance, so it cannot collapse the arm onto the body. The
      // Ground or the water's surface under the arm wins over that minimum, so the eye stays above it, even at the pivot
      const reach = computeGroundReach(pivot, Math.max(FOLLOW_CAMERA_MIN_DISTANCE, landmarkReach));
      armLength = reach < armLength ? reach : Math.min(reach, armLength + FOLLOW_CAMERA_EASE_OUT_SPEED * frameSeconds);
      camera.position.copy(pivot).addScaledVector(armDirection, armLength).sub(origin);
    },
    look: (input, facing) => {
      if (input.pressedActions.has(InputAction.ResetCamera)) {
        reset(facing);
        return;
      }
      yaw += input.lookYaw * (settings.horizontalSensitivity / FOLLOW_CAMERA_NEUTRAL_SENSITIVITY);
      pitch = clampPitch(pitch + input.lookPitch * (settings.verticalSensitivity / FOLLOW_CAMERA_NEUTRAL_SENSITIVITY));
      distance = Math.max(
        FOLLOW_CAMERA_MIN_DISTANCE,
        Math.min(FOLLOW_CAMERA_MAX_DISTANCE, distance + input.zoomSteps * FOLLOW_CAMERA_DISTANCE_PER_ZOOM_STEP),
      );
      turn();
    },
    reset,
    returnToDefaultDistance,
    get yaw() {
      return yaw;
    },
  };
};
