import type { HudFrame } from "#src/models/hud/HudFrame";
import type { WorldHudFrameOptions } from "#src/models/hud/WorldHudFrameOptions";
import type { MapCamera } from "#src/models/map/MapCamera";

import { useRafFn } from "@vueuse/core";
import { FOLLOW_CAMERA_PIVOT_SHARE } from "genshin-engine";
import { Euler, Vector3 } from "three";
import { reactive, shallowRef } from "vue";

// The map's camera and what the HUD's pieces read, both read off the camera, the body and the stamina each frame
export const useWorldHudFrame = ({
  characterBody,
  getCamera,
  getCapsuleHeight,
  getStamina,
  origin,
  staminaMaximum,
}: WorldHudFrameOptions) => {
  // The character's ground point in world metres, the yaw the view faces and the yaw the character faces, for the map and
  // The minimap, read each frame and handed on only when one moved, so a still player re-renders nothing
  const mapCamera = shallowRef<MapCamera>({ facing: 0, x: 0, yaw: 0, z: 0 });
  // What the HUD's pieces read each frame. The stamina meter's pivot is projected only while the pool is spent or
  // Refilling, and once it is full the meter fades out where it stood
  const hudFrame = reactive<HudFrame>({
    gadgetCooldown: 0,
    pivotX: 0,
    pivotY: 0,
    seconds: 0,
    sheerCold: 0,
    stamina: staminaMaximum.value,
  });
  const cameraEuler = new Euler();
  const pivot = new Vector3();
  useRafFn(() => {
    const activeCamera = getCamera();
    if (!activeCamera) return;
    const { x, y, z } = characterBody.position;
    const { y: facing } = characterBody.rotation;
    const { y: yaw } = cameraEuler.setFromQuaternion(activeCamera.quaternion, "YXZ");
    const { facing: lastFacing, x: lastX, yaw: lastYaw, z: lastZ } = mapCamera.value;
    if (x !== lastX || yaw !== lastYaw || z !== lastZ || facing !== lastFacing) mapCamera.value = { facing, x, yaw, z };
    const stamina = getStamina();
    if (stamina >= staminaMaximum.value && hudFrame.stamina >= staminaMaximum.value) return;
    hudFrame.stamina = stamina;
    pivot.set(x - origin.x, y + getCapsuleHeight() * FOLLOW_CAMERA_PIVOT_SHARE, z - origin.z).project(activeCamera);
    hudFrame.pivotX = (pivot.x + 1) / 2;
    hudFrame.pivotY = (1 - pivot.y) / 2;
  });
  return { hudFrame, mapCamera };
};
