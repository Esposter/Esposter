<script setup lang="ts">
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";
import type { FollowCamera, InputState, LandmarkCollider, Locomotion } from "genshin-engine";
import type { Object3D } from "three";

import water from "#src/data/windrise/water.json";
import { CAMERA_FRAME_PRIORITY, FIXED_STEP_SECONDS } from "#src/services/constants";
import { WINDRISE_START_POINT } from "#src/services/windrise/constants";
import { getWorldHeight } from "#src/services/world/getWorldHeight";
import { useLoop, useTres } from "@tresjs/core";
import { useEventListener } from "@vueuse/core";
import {
  createCharacterController,
  createFixedStepLoop,
  createFollowCamera,
  createGroundQuery,
  FOLLOW_CAMERA_PIVOT_HEIGHT,
} from "genshin-engine";
import { PerspectiveCamera, Vector3 } from "three";

interface Props {
  // What the character is drawn on, which the scene places in the floating origin's group: it is stood at the body's
  // Feet in the world's own coordinates and turned the way the body faces
  body: Object3D;
  // The frame's input, which the world screen reads once a frame before the body moves
  inputState: InputState;
  // Whether the body holds where it stands and the follow camera lets go of the view, as a menu or photo mode holds it
  isHeld?: true;
  landmarkCollider: LandmarkCollider;
  // How the character the body carries moves, its body type's, which a party switch changes
  locomotion: Locomotion;
  // The world coordinate the scene's origin stands on, which the floating origin moves
  origin: Vector3;
}

const { body, inputState, isHeld, landmarkCollider, locomotion, origin } = defineProps<Props>();
const { camera, renderer } = useTres();
const { onBeforeRender } = useLoop();
// The body moves in the world's own coordinates, read straight off the terrain's height function, so the floating
// Origin moves only what is drawn
const ground = createGroundQuery((x, z) => getWorldHeight(x, z), water.level);
const characterController = createCharacterController({
  ground,
  landmarkCollider,
  position: new Vector3(
    WINDRISE_START_POINT.x,
    getWorldHeight(WINDRISE_START_POINT.x, WINDRISE_START_POINT.z),
    WINDRISE_START_POINT.z,
  ),
});
let followCamera: FollowCamera | undefined;
const fixedStepLoop = createFixedStepLoop(FIXED_STEP_SECONDS, () => {
  characterController.step(inputState, followCamera?.yaw ?? 0, locomotion, FIXED_STEP_SECONDS);
});
const pivot = new Vector3();
// Ahead of the floating origin's shift, whatever order it mounts in: the frame's look turns the camera once, the steps
// Move the body, and the body is drawn and the camera follows it at its place between its last two steps, by how far
// The frame has come into the next. A held body stays drawn where it stands
onBeforeRender(({ delta }) => {
  const activeCamera = camera.value;
  const isFollowing = !isHeld && activeCamera instanceof PerspectiveCamera;
  if (isFollowing) {
    followCamera ??= createFollowCamera({ camera: activeCamera, ground, landmarkCollider });
    characterController.holdPresses(inputState);
    followCamera.look(inputState, characterController.facing);
    fixedStepLoop.advance(delta);
  }

  body.position.lerpVectors(
    characterController.previousPosition,
    characterController.position,
    fixedStepLoop.getStepShare(),
  );
  body.rotation.set(0, characterController.facing, 0);
  if (!isFollowing) return;
  pivot.copy(body.position);
  pivot.y += FOLLOW_CAMERA_PIVOT_HEIGHT;
  followCamera?.follow(pivot, origin, delta);
}, CAMERA_FRAME_PRIORITY);
// A click on the canvas takes the pointer, which the look reads while it is locked
useEventListener(renderer.domElement, "click", () => renderer.domElement.requestPointerLock());
const placedPosition = new Vector3();
// A jump stands the body on the ground at its pose's point, facing the pose's yaw, with the camera level behind it. The
// Party's stamina is read by the HUD's meter
defineExpose({
  place: ({ point, yaw }: WorldJumpPose) => {
    characterController.place(placedPosition.set(point.x, getWorldHeight(point.x, point.z), point.z), yaw);
    followCamera?.reset(yaw);
  },
  stamina: characterController.stamina,
});
</script>

<template />
