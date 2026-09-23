<script setup lang="ts">
import type { usePlayerInput } from "@/composables/agentConsole/world/usePlayerInput";
import type { PerspectiveCamera } from "three";

import { castThroughGrid } from "@/services/agentConsole/world/castThroughGrid";
import {
  CAMERA_DRAG_SPEED,
  CAMERA_FIELD_OF_VIEW,
  CAMERA_FIELD_OF_VIEW_SNAP,
  CAMERA_FOLLOW_SHARPNESS,
  CAMERA_MAX_DISTANCE,
  CAMERA_MAX_POLAR,
  CAMERA_MIN_DISTANCE,
  CAMERA_MIN_POLAR,
  CAMERA_SPRINT_FIELD_OF_VIEW_RATIO,
  CAMERA_START_POLAR,
  CAMERA_STICK_SPEED,
  CAMERA_WALL_MARGIN,
  CAMERA_ZOOM_SPEED,
  PLAYER_EYE_HEIGHT,
  PLAYER_SNEAK_DROP,
} from "@/services/agentConsole/world/constants";
import { createRoomGrid } from "@/services/agentConsole/world/createRoomGrid";
import { useAgentConsolePlayerStore } from "@/store/agentConsole/player";
import { MathUtils, Vector2, Vector3 } from "three";

interface Props {
  playerInput: ReturnType<typeof usePlayerInput>;
}

const { playerInput } = defineProps<Props>();
const { onBeforeRender } = useLoop();
const agentConsolePlayerStore = useAgentConsolePlayerStore();
const { playerState } = agentConsolePlayerStore;
const { renderer } = useTres();
const reducedMotion = usePreferredReducedMotion();
const roomGrid = createRoomGrid();
const camera = useTresTemplateRef<PerspectiveCamera>("camera");
const look = new Vector2();
const eye = new Vector3();
// The point the camera looks at and hangs its arm from, which trails the player's head by the follow's lag
const followedEye = new Vector3()
  .copy(playerState.renderPosition)
  .setY(playerState.renderPosition.y + PLAYER_EYE_HEIGHT);
const armDirection = new Vector3();
let polar = CAMERA_START_POLAR;
let distance = CAMERA_MAX_DISTANCE;
// The arm's length after walls, which pulls in at once so a wall never hides the player, and eases back out
let armLength = CAMERA_MAX_DISTANCE;
let dragPointerId: number | undefined;
// A drag anywhere on the room turns the camera around the player and tilts it; a touch drag is the same, since the
// Joystick takes its own pointer before the canvas sees it
useEventListener(renderer.domElement, "pointerdown", (event: PointerEvent) => {
  dragPointerId = event.pointerId;
  renderer.domElement.setPointerCapture(event.pointerId);
});
useEventListener(renderer.domElement, "pointermove", (event: PointerEvent) => {
  if (event.pointerId !== dragPointerId) return;
  playerState.cameraAzimuth -= event.movementX * CAMERA_DRAG_SPEED;
  polar = MathUtils.clamp(polar - event.movementY * CAMERA_DRAG_SPEED, CAMERA_MIN_POLAR, CAMERA_MAX_POLAR);
});
useEventListener(renderer.domElement, "pointerup", (event: PointerEvent) => {
  if (event.pointerId === dragPointerId) dragPointerId = undefined;
});
useEventListener(
  renderer.domElement,
  "wheel",
  (event: WheelEvent) => {
    event.preventDefault();
    distance = MathUtils.clamp(
      distance * Math.exp(event.deltaY * CAMERA_ZOOM_SPEED),
      CAMERA_MIN_DISTANCE,
      CAMERA_MAX_DISTANCE,
    );
  },
  { passive: false },
);
// Behind and above the player, looking at its head, following with a little lag that reads as weight. Asked for
// Reduced motion, it follows rigidly, since a camera that moves differently from the input can make a person sick
onBeforeRender(({ delta }) => {
  if (!camera.value) return;
  playerInput.readLook(look);
  playerState.cameraAzimuth -= look.x * CAMERA_STICK_SPEED * delta;
  polar = MathUtils.clamp(polar + look.y * CAMERA_STICK_SPEED * delta, CAMERA_MIN_POLAR, CAMERA_MAX_POLAR);
  const isReducedMotion = reducedMotion.value === "reduce";
  const followRatio = isReducedMotion ? 1 : 1 - Math.exp(-CAMERA_FOLLOW_SHARPNESS * delta);
  eye
    .copy(playerState.renderPosition)
    .setY(playerState.renderPosition.y + PLAYER_EYE_HEIGHT - (playerState.isSneaking ? PLAYER_SNEAK_DROP : 0));
  followedEye.lerp(eye, followRatio);
  armDirection.setFromSphericalCoords(1, polar, playerState.cameraAzimuth);
  // A spring arm: where a wall stands between the player and the camera, the camera comes in to just in front of it
  const clearLength = Math.max(castThroughGrid(roomGrid, followedEye, armDirection, distance) - CAMERA_WALL_MARGIN, 0);
  armLength = clearLength < armLength ? clearLength : armLength + (clearLength - armLength) * followRatio;
  camera.value.position.copy(followedEye).addScaledVector(armDirection, armLength);
  camera.value.lookAt(followedEye);
  // A sprint widens the view as Minecraft's does, unless reduced motion is asked for
  const fieldOfView =
    playerState.isSprinting && !isReducedMotion
      ? CAMERA_FIELD_OF_VIEW * CAMERA_SPRINT_FIELD_OF_VIEW_RATIO
      : CAMERA_FIELD_OF_VIEW;
  if (camera.value.fov === fieldOfView) return;
  camera.value.fov += (fieldOfView - camera.value.fov) * followRatio;
  if (Math.abs(fieldOfView - camera.value.fov) < CAMERA_FIELD_OF_VIEW_SNAP) camera.value.fov = fieldOfView;
  camera.value.updateProjectionMatrix();
});
</script>

<template>
  <TresPerspectiveCamera ref="camera" :fov="CAMERA_FIELD_OF_VIEW" />
</template>
