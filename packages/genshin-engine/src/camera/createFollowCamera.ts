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
} from "#src/camera/constants";
import { InputAction } from "#src/models/input/InputAction";
import { Euler, Vector3 } from "three";

// A camera orbiting a pivot above a body, as the game's follows its character. The look turns it once a frame, clamped
// Short of straight up and down, and zooms it by the wheel within its range. The eye stands on the arm out from the
// Pivot, short of the first landmark a sphere cast along the arm touches and of the first point stepped along it under
// The ground or the water's surface: it is pulled in at once and eases back out once the way clears
export const createFollowCamera = ({
  camera,
  ground,
  landmarkCollider,
  settings,
}: FollowCameraOptions): FollowCamera => {
  const euler = new Euler().setFromQuaternion(camera.quaternion, "YXZ");
  const armDirection = new Vector3();
  let yaw = euler.y;
  let pitch = euler.x;
  let distance = settings.defaultDistance;
  let armLength = distance;
  camera.fov = FOLLOW_CAMERA_FOV;
  camera.updateProjectionMatrix();
  const turn = (): void => {
    euler.set(pitch, yaw, 0, "YXZ");
    camera.quaternion.setFromEuler(euler);
  };
  const reset = (facing: number): void => {
    yaw = facing;
    pitch = 0;
    distance = settings.defaultDistance;
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
  return {
    follow: (pivot, origin, frameSeconds) => {
      armDirection.set(Math.sin(yaw) * Math.cos(pitch), -Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
      const landmarkReach = landmarkCollider.castSphere(pivot, armDirection, distance, FOLLOW_CAMERA_CLEARANCE);
      const reach = computeGroundReach(pivot, landmarkReach);
      armLength = reach < armLength ? reach : Math.min(reach, armLength + FOLLOW_CAMERA_EASE_OUT_SPEED * frameSeconds);
      camera.position.copy(pivot).addScaledVector(armDirection, armLength).sub(origin);
    },
    look: (input, facing) => {
      if (input.pressedActions.has(InputAction.ResetCamera)) {
        reset(facing);
        return;
      }
      yaw += input.lookYaw * (settings.horizontalSensitivity / FOLLOW_CAMERA_NEUTRAL_SENSITIVITY);
      pitch = Math.max(
        FOLLOW_CAMERA_MIN_PITCH,
        Math.min(
          FOLLOW_CAMERA_MAX_PITCH,
          pitch + input.lookPitch * (settings.verticalSensitivity / FOLLOW_CAMERA_NEUTRAL_SENSITIVITY),
        ),
      );
      distance = Math.max(
        FOLLOW_CAMERA_MIN_DISTANCE,
        Math.min(FOLLOW_CAMERA_MAX_DISTANCE, distance + input.zoomSteps * FOLLOW_CAMERA_DISTANCE_PER_ZOOM_STEP),
      );
      turn();
    },
    reset,
    get yaw() {
      return yaw;
    },
  };
};
