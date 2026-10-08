import type { FreeCamera } from "#src/models/camera/FreeCamera";
import type { FreeCameraOptions } from "#src/models/camera/FreeCameraOptions";

import {
  FREE_CAMERA_BASE_SPEED,
  FREE_CAMERA_CLEARANCE,
  FREE_CAMERA_MAX_PITCH,
  FREE_CAMERA_SPEED_PER_HEIGHT,
} from "#src/camera/constants";
import { Euler } from "three";

// A camera flown over the ground: a step's move goes along the view on the ground and straight up or down, faster the
// Higher it is, and never under the ground or the water's surface. The look, once a frame rather than once a step,
// Turns its yaw and tilts its pitch, read from where it already faces
export const createFreeCamera = ({ camera, ground }: FreeCameraOptions): FreeCamera => {
  const euler = new Euler().setFromQuaternion(camera.quaternion, "YXZ");
  let yaw = euler.y;
  let pitch = euler.x;
  return {
    look: (input) => {
      yaw += input.lookYaw;
      pitch = Math.max(-FREE_CAMERA_MAX_PITCH, Math.min(FREE_CAMERA_MAX_PITCH, pitch + input.lookPitch));
      euler.set(pitch, yaw, 0, "YXZ");
      camera.quaternion.setFromEuler(euler);
    },
    step: (input, stepSeconds) => {
      const heightAboveGround = camera.position.y - ground.getGround(camera.position.x, camera.position.z).height;
      const speed = FREE_CAMERA_BASE_SPEED + Math.max(0, heightAboveGround) * FREE_CAMERA_SPEED_PER_HEIGHT;
      const distance = speed * stepSeconds;
      const forwardX = -Math.sin(yaw);
      const forwardZ = -Math.cos(yaw);
      const rightX = Math.cos(yaw);
      const rightZ = -Math.sin(yaw);
      camera.position.x += (forwardX * input.moveForward + rightX * input.moveRight) * distance;
      camera.position.z += (forwardZ * input.moveForward + rightZ * input.moveRight) * distance;
      camera.position.y += input.moveUp * distance;
      const floorHeight = Math.max(
        ground.getGround(camera.position.x, camera.position.z).height,
        ground.getWaterLevel(),
      );
      camera.position.y = Math.max(camera.position.y, floorHeight + FREE_CAMERA_CLEARANCE);
    },
  };
};
