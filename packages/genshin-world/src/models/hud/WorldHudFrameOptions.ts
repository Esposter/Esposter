import type { Camera, Object3D, Vector3 } from "three";
import type { Ref } from "vue";

// What the HUD's frame is read from each frame: the body whose ground point the map follows, the camera the world is
// Drawn through and the origin it is drawn from, and the stamina and the capsule height the meter's pivot stands at
export interface WorldHudFrameOptions {
  characterBody: Object3D;
  getCamera: () => Camera | undefined;
  getCapsuleHeight: () => number;
  getStamina: () => number;
  origin: Vector3;
  // The most the party's stamina holds, which the meter is full at
  staminaMaximum: Readonly<Ref<number>>;
}
