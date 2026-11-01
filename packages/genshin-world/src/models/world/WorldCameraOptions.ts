import type { WorldCameraPose } from "#src/models/world/WorldCameraPose";
import type { TresCanvasInstance } from "@tresjs/core";
import type { Vector3 } from "three";
import type { Ref } from "vue";

// What the camera is read through: the canvas the world is drawn on, the pose a reference holds it still at, whether the
// World is paused, and the floating origin its position is offset by
export interface WorldCameraOptions {
  canvas: Readonly<Ref<null | TresCanvasInstance>>;
  getCameraPose: () => undefined | WorldCameraPose;
  getIsPaused: () => boolean;
  origin: Vector3;
}
